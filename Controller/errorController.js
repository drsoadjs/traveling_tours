const AppError = require('../Utils/appError');

const handleExpireJWTError = (err) => {
  return new AppError(
    'YOU ARE LOGGED OUT; PLEASE LOGIN AGAIN TO GAIN ACCESS',
    401
  );
};

const handlejsonwebtokenError = (err) => {
  const message = 'YOU ARE NOT LOGGED IN : PLEASE LOGIN TO GAIN ACCESS';

  return new AppError(message, 401);
};

const handleDuplicateError = (err) => {
  return new AppError('duplicate key error', 400);
};

const handleObjectIdErrorDB = (err) => {
  // console.log(err);
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const validationErrors = Object.values(err.errors).map((val) => val.message);
  const message = `${validationErrors.join('. ')} `;
  return new AppError(message, 404);
};

const handleErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });
};

const handleErrorProd = (err, res) => {
  console.log(err.isOperational, err);

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: 'SOMETHING WENT WRONG',
    });
    console.log('ERROR', err);
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    handleErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.kind === 'ObjectId') {
      error = handleObjectIdErrorDB(error);
    }
    if (
      error._message === 'Tours validation failed' ||
      error._message === 'Users validation failed'
    ) {
      error = handleValidationError(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateError(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handlejsonwebtokenError(error);
    }

    if (error.name === 'TokenExpiredError') {
      error = handleExpireJWTError(error);
    }
    handleErrorProd(error, res);
  }

  next();
};
