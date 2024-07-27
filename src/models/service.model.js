const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    condition: {
      type: [String],
      default: [],
    },
    addon: {
      type: [String],
      default: [],
    },
    imgUrl: {
      type: String,
      default:
        'https://firebasestorage.googleapis.com/v0/b/imagehost-425407.appspot.com/o/img%2Flogo.png?alt=media&token=9661da31-163f-46c2-8027-bb48f7d6e28c',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
serviceSchema.plugin(toJSON);
serviceSchema.plugin(paginate);

/**
 * @typedef Service
 */
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
