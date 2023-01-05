const express = require('express');
const {
  getAllTours,
  createTour,
  getSingleTour,
  updateTour,
  deleteTour,
  getTourStat,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = require('./../Controller/tourController');
const { protect, restrictTo } = require('./../Controller/authController');
const reviewRouter = require('../Router/reviewRouter');

// create Route
const router = express.Router();

// tour/review nested routes
router.use('/:tourId/reviews', reviewRouter);

// special easy access routes
router.route('/stat').get(getTourStat);
router.route('/monthlyPlan/:year').get(getMonthlyPlan);

// geoSpatial Routes
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);
// CRUD Operations Routes
router.route('/').get(getAllTours).post(protect, createTour);
router
  .route('/:id')
  .get(getSingleTour)
  .patch(protect, restrictTo('admin'), updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);

//exports route to the root file which normally is app.js
module.exports = router;
