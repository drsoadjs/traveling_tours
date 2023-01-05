const Review = require('../Model/reviewModel');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./factory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
};
exports.getAllReview = getAll(Review);
exports.createReview = createOne(Review);
exports.getReview = getOne(Review);
exports.patchReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);
