const express = require('express');
const {
  getAllReview,
  createReview,
  getReview,
  patchReview,
  deleteReview,
  setTourUserIds,
} = require('../controller/reviewController');
const { protect, restrictTo } = require('../controller/authController');

router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReview)
  .post(restrictTo('user'), setTourUserIds, createReview);

router.use(restrictTo('user', 'admin'));
router.route('/:id').get(getReview).patch(patchReview).delete(deleteReview);

module.exports = router;
