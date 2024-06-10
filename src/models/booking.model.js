const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');
// const { priceList } = require('../config/priceList');

const bookingSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // Ensuring email is stored in lowercase
    },
    phoneNumber: {
      // Changed from 'number' to 'phoneNumber' for clarity
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'AWAIT_DOWNPAYMENT', 'AWAIT_FULLPAYMENT', 'CANCELED', 'COMPLETED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true, // This option creates 'createdAt' and 'updatedAt' fields automatically
  }
);

// add plugin that converts mongoose to json
bookingSchema.plugin(toJSON);
bookingSchema.plugin(paginate);

/**
 * @typedef Booking
 */
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
