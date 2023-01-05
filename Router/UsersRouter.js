const express = require('express');

const {
  getAllUsers,
  createUser,
  getUser,
  patchUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require('./../controller/userController');

const {
  signUp,
  logIn,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} = require('./../controller/authController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/logIn', logIn);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router.route('/updateMe').patch(updateMe);
router.route('/updateMyPassword').patch(updatePassword);
router.route('/deleteMe').post(deleteMe);
router.route('/getMe').get(getMe, getUser);

//router.route('/forgotPassword').post(forgotPassword);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(patchUser).delete(deleteUser);

module.exports = router;
