const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const toursRouter = require('./Router/ToursRouter');
const usersRouter = require('./Router/UsersRouter');
const reviewRouter = require('./Router/reviewRouter');
const viewRouter = require('./Router/viewRouter');
const errorController = require('./Controller/errorController');
const AppError = require('./Utils/appError');

const app = express();

// SET SECURITY HEADERS
//app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// SET UP PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// BODY PARSER
app.use(
  express.json({
    limit: '30kb',
  })
);

app.use(cookieParser());

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({ origin: '*' }));

// DATA SANITIZATION
app.use(mongoSanitize());
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// CHECK FOR ENVIRONMENTS
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// RATE LIMITER
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);

app.use('/api', (req, res, next) => {
  console.log('testing cookies');
  console.log(req.cookies);

  next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);

// NOT FOUND ROUTES ERROR HANDLER

app.use('*', (req, res, next) => {
  //const err = new Error();

  //err.message = `${req.originalUrl} does not exist`;
  // err.statusCode = 404;

  //res.status(404).json({
  // status: 'FAIL',
  //  mee: `${err.status}`,
  // message: `${req.originalUrl} does //not exist`,
  // });

  next(new AppError(`${req.originalUrl} does not exist `, 404));
});

// GLOBAL ERROR HANDLER
app.use(errorController);
module.exports = app;
