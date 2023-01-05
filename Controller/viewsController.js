const AppError = require('../Utils/appError');
const Tour = require('../Model/TourModel');
const catchAsync = require('../Utils/catchAsync');

exports.getOverView = catchAsync(async (req, res, next) => {
  // GET TOUR DATA FROM COLLECTION
  const tours = await Tour.find();
  console.log('not showing');
  // BUILD TEMPLATE

  // RENDER THE DATA USING THE TEMPLATE
  res.status(200).render('overview', {
    title: 'Tours Overview',
    tours,
  });
});

exports.getTourPage = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login-In',
  });
});
