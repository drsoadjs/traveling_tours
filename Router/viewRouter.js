const express = require('express');
const {
  getOverView,
  getTourPage,
  login,
} = require('../Controller/viewsController');
const { protect, restrictTo } = require('../Controller/authController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

router.get('/', getOverView);

router.get('/login', login);

router.get('/tour/:slug', getTourPage);

module.exports = router;
