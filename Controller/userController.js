const User = require('./../Model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./factory');

// function to filter the req.body so as to avoid parameters pollution used in updateMe Route function
const filterObj = (obj, ...allwowedFeilds) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allwowedFeilds.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getAllUsers = getAll(User);
exports.createUser = createOne(User);
exports.getUser = getOne(User);
exports.patchUser = updateOne(User);
exports.deleteUser = deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create Error if user post password data

  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('This route cannot update passoword', 400));
  }

  // find the current log in user and update since there is no need for validation
  const filteredBody = filterObj(req.body, 'name', 'email');

  // filter the unwanted field names that are not required for user upadates

  const updatedUser = User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    validation: true,
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //1. get the  current user and update
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
  });
});
