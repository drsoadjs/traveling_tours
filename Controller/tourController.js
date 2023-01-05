const AppError = require('../Utils/appError');
const Tour = require('../Model/TourModel');
const catchAsync = require('../Utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./factory');

exports.createTour = createOne(Tour);
exports.getAllTours = getAll(Tour);
exports.getSingleTour = getOne(Tour, { path: 'reviews' });
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

exports.getTourStat = async (req, res, next) => {
  const tourStat = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        tourNum: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avrRating: { $avg: '$ratingsAverage' },
        avrPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  if (!tourStat) {
    return next(new AppError('RESOURCE NOT FOUND', 404));
  }
  res.status(200).json({
    message: 'SUCCESS',
    data: {
      tourStat,
    },
  });
};

exports.getMonthlyPlan = async (req, res, next) => {
  //  console.log(req.params);
  const year = req.params.year * 1;
  const monthlyPlan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        tourNum: { $sum: 1 },
        tourNames: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        tourNum: -1,
      },
    },
  ]);
  if (!monthlyPlan) {
    return next(new AppError('RESOURCE NOT FOUND', 404));
  }

  res.status(200).json({
    message: 'SUCCESS',
    length: monthlyPlan.length,
    data: {
      monthlyPlan,
    },
  });
};

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 2963.2 : distance / 6378.1;

  if (!lat || !lng || !radius) {
    return next(
      new AppError(
        'please provide a latitude and longititude in the lat lng format',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'Success',
    results: tours.length,
    message: 'its all cool for now',
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.00062137 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'please provide a latitude and longititude in the lat lng format',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 2],
        },
        distanceField: 'distances',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distances: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    message: 'its all cool for now',
    data: {
      data: distances,
    },
  });
});
/*
exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  if (!tour) {
    next(
      new AppError('NOT CREATED: PLEASE CHECK YOUR DETAILS AND TRY AGAIN', 400)
    );
  }
  res.status(201).json({
    message: 'SUCCESS',
    data: {
      tour,
    },
  });
});

exports.getAllTours = async (req, res, next) => {
  const feat = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .pagination()
    .fields();
  const tours = await feat.query;

  res.status(200).json({
    status: 'Success',
    length: tours.length,
    data: {
      tours,
    },
  });
};

exports.getSingleTour = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const tour = await Tour.findById(req.params.id).populate('reviews');
  if (!tour) {
    return next(new AppError('RESOURCE NOT FOUND', 404));
  }
  res.status(200).json({
    message: 'SUCCESS',
    data: {
      tour,
    },
  });
});

exports.deleteTour = async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('FAILED TO DELETE', 400));
  }
  res.status(204).json({
    message: 'SUCCESS',
  });
};

exports.updateTour = async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('FAILED TO UPDATE', 400));
  }

  res.status(200).json({
    message: 'SUCCESS',
    data: {
      tour,
    },
  });
};*/
