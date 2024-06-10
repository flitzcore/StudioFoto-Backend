const httpStatus = require('http-status');
const axios = require('axios');
const config = require('../config/config');
const { Booking } = require('../models');
const ApiError = require('../utils/ApiError');

const generateExternalId = () => {
  return `invoice-${Date.now()}`;
};
const sendToXendit = async (bookingData) => {
  const data = {
    external_id: generateExternalId(),
    amount: bookingData.totalPrice,
    payer_email: bookingData.email,
    description: bookingData.description,
  };

  const xenditConfig = {
    method: 'post',
    url: 'https://api.xendit.co/v2/invoices',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${config.xendit.apiKey}`,
    },
    data,
  };

  const response = await axios(xenditConfig);

  return response;
};
/**
 * Create a booking
 * @param {Object} bookingBody
 * @returns {Promise<Booking>}
 */
const createBooking = async (bookingBody) => {
  const bookingData = {
    name: bookingBody.name,
    description: bookingBody.description,
    email: bookingBody.email,
    phoneNumber: bookingBody.phoneNumber,
    date: bookingBody.date,
    address: `${bookingBody.address}, ${bookingBody.province}, ${bookingBody.city}`,
  };
  // Set the price for invoice
  if (bookingBody.dp > 0) {
    bookingData.totalPrice = bookingBody.dp;
    bookingData.status = 'AWAIT_DOWNPAYMENT';
  } else {
    bookingData.totalPrice = bookingBody.price;
    bookingData.status = 'AWAIT_FULLPAYMENT';
  }

  const xenditResponse = await sendToXendit(bookingData);
  if (!xenditResponse) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create invoice');
  }
  // Set the real total price before save it to the database
  bookingData.invoiceId = xenditResponse.data.id;
  bookingData.totalPrice = bookingBody.price + bookingBody.dp;
  await Booking.create(bookingData);
  // Create a new object with all properties of booking except invoiceId
  const responseObject = {
    url: xenditResponse.data.invoice_url,
    ...bookingData,
  };
  return responseObject;
};

/**
 * Query for bookings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBookings = async (filter, options) => {
  const bookings = await Booking.paginate(filter, options);
  return bookings;
};

/**
 * Get booking by id
 * @param {ObjectId} id
 * @returns {Promise<Booking>}
 */
const getBookingById = async (id) => {
  return Booking.findById(id);
};

/**
 * Get booking by email
 * @param {string} email
 * @returns {Promise<Booking>}
 */
const getBookingByEmail = async (email) => {
  return Booking.findOne({ email });
};

/**
 * Delete booking by id
 * @param {ObjectId} bookingId
 * @returns {Promise<Booking>}
 */
const deleteBookingById = async (bookingId) => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  await booking.remove();
  return booking;
};
const setInvoicePaid = async (invoiceBody) => {
  const booking = await Booking.findOne({ invoiceId: invoiceBody.id });
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  if (booking.totalPrice - booking.totalPaid - invoiceBody.paid_amount === 0) {
    booking.status = 'COMPLETED';
  } else if (booking.totalPrice - booking.totalPaid - invoiceBody.paid_amount > 0) {
    booking.status = 'AWAIT_FULLPAYMENT';
  }
  booking.totalPaid += invoiceBody.paid_amount;
  if (booking.status === 'AWAIT_FULLPAYMENT') {
    const bookingData = {
      totalPrice: booking.totalPrice - booking.totalPaid,
      email: booking.email,
      description: `Remaining Payment: ${booking.description}`,
    };

    const xenditResponse = await sendToXendit(bookingData);
    console.log(xenditResponse.data.invoice_url);
    if (!xenditResponse) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create invoice');
    }
    booking.invoiceId = xenditResponse.data.id;
  }
  await booking.save();
  return booking;
};

module.exports = {
  createBooking,
  queryBookings,
  getBookingById,
  getBookingByEmail,
  deleteBookingById,
  setInvoicePaid,
};
