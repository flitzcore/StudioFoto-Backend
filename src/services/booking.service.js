const httpStatus = require('http-status');
const axios = require('axios');
const config = require('../config/config');
const { Booking } = require('../models');
const emailService = require('./email.service');
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
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}
/**
 * Send complete email
 * @param {string} to
 * @param {string} name
 * @param {string} date
 * @returns {Promise}
 */
const sendServiceCompletedEmail = async (to, name, date) => {
  const subject = 'Terima Kasih Atas Kepercayaan Anda pada Potrait Plus';
  const text = `Dear ${name},
Terima kasih telah memilih Potrait Plus untuk kebutuhan fotografi Anda. Kami berharap pengalaman Anda bersama kami memberikan kenangan yang indah dan hasil yang memuaskan.

Kami ingin mengonfirmasi bahwa kami telah menerima pembayaran penuh untuk layanan pada ${formatDate(
    date
  )}. Kami sangat menghargai kepercayaan Anda pada layanan kami dan berterima kasih atas kesempatan untuk melayani Anda.

Jika Anda memiliki pertanyaan atau membutuhkan informasi lebih lanjut, jangan ragu untuk menghubungi kami. Kami juga senang menerima masukan atau testimoni dari Anda, yang bisa sangat membantu kami untuk meningkatkan layanan di masa mendatang.

Kami berharap dapat kembali bekerja sama dengan Anda di kesempatan berikutnya.

Terima kasih sekali lagi atas dukungan Anda :)`;
  await emailService.sendEmail(to, subject, text);
};
/**
 * Send dp email
 * @param {string} to
 * @param {string} name
 * @param {string} date
 * @returns {Promise}
 */
const sendDpCompletedEmail = async (to, amount, name, date, url) => {
  const subject = 'Konfirmasi Pembayaran Uang Muka dan Informasi Pembayaran Selanjutnya';
  const text = `Dear ${name},
Terima kasih telah melakukan pembayaran uang muka untuk layanan kami. Kami ingin mengonfirmasi bahwa kami telah menerima pembayaran Anda sebesar ${amount} pada ${formatDate(
    date
  )}.

Untuk melanjutkan proses dan menyelesaikan pembayaran penuh, silakan kunjungi tautan berikut: ${url}

Pembayaran penuh dapat dilakukan melalui tautan di atas. Apabila Anda memiliki pertanyaan atau memerlukan bantuan lebih lanjut, jangan ragu untuk menghubungi kami.`;
  await emailService.sendEmail(to, subject, text);
};
const setInvoicePaid = async (invoiceBody) => {
  const booking = await Booking.findOne({ invoiceId: invoiceBody.id });
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  if (booking.totalPrice - booking.totalPaid - invoiceBody.paid_amount === 0) {
    booking.status = 'COMPLETED';
    sendServiceCompletedEmail(booking.email, booking.name, booking.date);
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
    sendDpCompletedEmail(
      booking.email,
      booking.totalPrice - booking.totalPaid,
      booking.name,
      xenditResponse.data.created,
      xenditResponse.data.invoice_url
    );
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
