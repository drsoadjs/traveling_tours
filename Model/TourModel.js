const mongoose = require('mongoose');
const slugify = require('slugify');

tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'A Tour must have a Name'],
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have a Duration'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'difficult', 'medium'],
      required: [true, 'A Tour must have a Difficulty Level'],
    },

    ratingsAverage: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have a Price'],
    },
    summary: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'A Tour must have a Discription'],
      trim: true,
    },
    startDates: {
      type: [Date],
    },
    images: {
      type: [String],
    },

    imageCover: {
      type: String,
      required: [true, 'A Tour must have a Image cover'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a Group Size'],
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
      address: {
        type: String,
      },
      description: {
        type: String,
      },
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
        },
        address: {
          type: String,
        },
        description: {
          type: String,
        },
        day: {
          type: Number,
        },
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//indexes
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ slug: 1 });
// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: 'name role photo',
  });
  next();
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
