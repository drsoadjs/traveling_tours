const mongoose = require('mongoose');
const fs = require('fs');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('./Model/TourModel');
const User = require('./Model/UserModel');
const Review = require('./Model/reviewModel');
const db = process.env.NATOURSDB;

mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const tour = JSON.parse(fs.readFileSync('./dev-data/data/tours.json', 'utf-8'));
const user = JSON.parse(fs.readFileSync('./dev-data/data/users.json', 'utf-8'));
const review = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8')
);
const importData = async () => {
  try {
    await Tour.create(tour);
    await Review.create(review);
    await User.create(user, { validateBeforeSave: false });
    console.log('UPLOADED!!!!!');
    process.exit();
  } catch (err) {
    console.log(err, 'not uploaded');
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('deleted!!!!!');
    process.exit();
  } catch (err) {
    console.log(err, 'not deleted');
  }
};

if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
