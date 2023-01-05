const { promisify } = require('util');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const User = require('./../Model/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendMail = require('./../utils/email');

const createjwt = (id) => {
  return jwt.sign({ id: id }, process.env.SECRET, {
    expiresIn: process.env.JWTEXPIRYDATE,
  });
};

const createSendToken = async (res, statusCode, user) => {
  const token = await createjwt(user._id);
  // SEND JWT THROUGH COOKIE TO THE CLIENT
  // Date.now() + process.env.JWTEXPIRYDATE_COOKIE + 24 * 60 * 60 * 1000
  const cookieOptions = {
    expires: new Date(Date.now() + 90 + 24 * 60 * 60 * 1000),
    httpOnly: true,
    withCredentials: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
    np;
  }

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'Success',
    data: {
      user,
      token,
    },
  });
};

// SIGNING UP AND AUTO LOGIN
exports.signUp = catchAsync(async (req, res, next) => {
  // GET THE USER DATA FROM THE REQUEST AND CREATE
  filterObj = (reqObj, ...allowedFields) => {
    let obj = {};
    Object.keys(reqObj).forEach((el) => {
      if (allowedFields.includes(el)) obj[el] = reqObj[el];
    });
    return obj;
  };
  const bodyObject = filterObj(
    req.body,
    'name',
    'password',
    'confirmPassword',
    'email',
    'photo'
  );
  const newUser = await User.create(bodyObject);
  // CREATE A JWT TOKEN
  //HASH OR ENCRPT YOUR PASSWORD USING THE PRE SAVE MIDDLEWARE HOOK
  createSendToken(res, 201, newUser);
  //const token = await createjwt(newUser._id);
  // SEND A RESPONSE INCLUDING THE JWT TO THE USER MEANING THE USER IS LOGIN
  // res.status(201).json({
  //  status: 'Success',
  //  data: {
  //   user: newUser,
  //   token,
  //  },
  // });
});

// ACTUAL LOGIN OF EXISTING USER
exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //console.log(email, password);
  //1.CHECK IF THE EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Please input your email or Password', 400));
  }
  //2.CHECK IF THE EMAIL AND PASSWORD IS CORRECT BY FINDING AND FETCHING THE MATCHING EMAIL THEN INCLUDE THE PASSWORD SINCE THE PASSWORD IS USUALLY SET TO FALSE IN THE MODEL
  const user = await User.findOne({ email }).select('+password');

  //console.log(user);
  // COMPARE THE INPUTED PASSWORD WITH THE DATABASE PASSWORD BY USING THE INSTANCE METHOD AND THE BCRYPT COMPARE METHOD
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('INCORRECT EMAIL OR PASSWORD', 401));
  }

  //3. SEND TOKEN BACK TO THE CLIENT
  createSendToken(res, 200, user);

  //const token = await createjwt(user._id);
  // res.status(200).json({
  // status: 'Success',
  // data: {
  //   token,
  //  },
  // });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1 GET THE TOKEN CHECK TO CHECK IF THE USER IS LOGIN
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('YOU ARE NOT LOOGED IN, PLEASE DO LOGIN TO GET ACCESS', 401)
    );
  }
  //2 VERIFY IF THE TOKEN IS CORRECT
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

  //console.log(decoded);
  //3 CHECK IF THE USER STILL EXIST  BY GETTING THE ID FORM THE TOKEN AND QUERY WITH IT

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError(
        'USER NO LONGER EXIST: PLEASE DO CHECK YOUR LOGIN DETAILS AND TRY AGAIN',
        401
      )
    );
  }

  // 4 CHECK IF THE PASSWORD IS STILL VALID
  const changed = freshUser.changedPasswordAfter(decoded.iat);

  if (changed) {
    return next(
      new AppError('INCORRECT PASSWORD OR PASSWORD HAS BEEN CHANGED', 401)
    );
  }

  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      //console.log(req.user.role);
      next(
        new AppError('YOU ARE NOT AUTHORIZED TO PERFORM THIS OPERATION', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 GET USER FROM THE EMAIL
  const user = await User.findOne({ email: req.body.email });

  // verify if the user exists
  if (!user) {
    return next(new AppError('THERE IS NO USER WITH THAT EMAIL', 404));
  }
  // 2.GENERATE THE RANDOM TOKEN
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
  //3. SEND TO USER THROUGH THE EMAIL

  /*const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password ? submit a request to ${resetURL} `;
  try {
    await sendMail({
      email: user.email,
      subject: 'password Reset Token, valid for 10mins',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to your Email',
    });
  } catch {
    user.PasswordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('THERE WAS AN ERROR SENDING EMAIL; PLEASE TRY AGAIN', 500)
    );
  }
  */
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token
  //const hashedtoken = req.params.token;

  const hashedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //console.log(hashedtoken);
  //console.log(req.params.token, '-----', hashedtoken);
  const user = await User.findOne({
    passwordResetToken: hashedtoken,
  });
  //console.log(user);

  // update the user password and set all the reset parameters to undefined and finally save the document
  if (!user) {
    return next(
      new AppError(
        'Token has expired please resend email, and get a new token',
        401
      )
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenexpiresIn = undefined;
  await user.save();

  //log the user in
  createSendToken(res, 200, user);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 get the user from the collection
  const email = req.user.email;

  const user = await User.findOne({ email: email }).select('+password');
  //2 check if the pasword is correct
  const password = req.body.password;
  if (!user && !correctPassword(password, user.password)) {
    return next(
      new AppError('Password incorrect, please input the valid password', 401)
    );
  }
  // update the pasword
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;

  await user.save();
  //log the user in
  createSendToken(res, 200, user);
});
