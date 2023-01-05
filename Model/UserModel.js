const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please input Your Full Name'],
  },
  email: {
    type: String,
    required: [true, 'please input a validate email'],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, 'please input a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },

  photo: {
    type: String,
  },
  confirmPassword: {
    type: String,
    required: [true, 'input valid password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordChangeAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordResetTokenexpiresIn: {
    type: Number,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.isNew) {
    // console.log("it worked");
    return next();
  }

  // console.log("it didnt work");
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;

  this.passwordChangeAt = Date.now() - 2000;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

/*userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangeAt = Date.now() - 5000;
  next();
});*/

userSchema.methods.correctPassword = async function (
  inputedpassword,
  dbpassword
) {
  return await bcrypt.compare(inputedpassword, dbpassword);
};

userSchema.methods.changedPasswordAfter = function (jwttimestamp) {
  if (this.passwordChangeAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    //console.log(jwttimestamp, changedTimeStamp);
    // console.log(jwttimestamp < changedTimeStamp);

    return jwttimestamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //this.passwordResetToken = resetToken;
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetTokenexpiresIn = Date.now() + 5 * 24 * 60 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
