const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const ApiFeatures = require('../Utils/ApiFeatures');

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('FAILED TO DELETE', 400));
    }
    res.status(204).json({
      message: 'SUCCESS',
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('FAILED TO UPDATE DOCUMENT', 400));
    }

    res.status(200).json({
      message: 'SUCCESS',
      data: {
        data: doc,
      },
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (!doc) {
      next(
        new AppError(
          'DOCUMENT NOT CREATED: PLEASE CHECK YOUR DETAILS AND TRY AGAIN',
          400
        )
      );
    }
    res.status(201).json({
      message: 'SUCCESS',
      data: {
        data: doc,
      },
    });
  });
};

exports.getOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError('RESOURCE NOT FOUND', 404));
    }
    res.status(200).json({
      message: 'SUCCESS',
      data: {
        data: doc,
      },
    });
  });
};

exports.getAll = (Model) => {
  return async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const feat = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .pagination()
      .fields();
    const docs = await feat.query;
    //const docs = await feat.query.explain();

    res.status(200).json({
      status: 'Success',
      length: docs.length,
      data: {
        data: docs,
      },
    });
  };
};
