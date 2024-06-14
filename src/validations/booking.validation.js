const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBooking = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    email: Joi.string().required().email(),
    phoneNumber: Joi.string().required(),
    date: Joi.date().required(),
    province: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    price: Joi.number().required(),
    dp: Joi.number().required(),
  }),
};

const getBookings = {
  query: Joi.object().keys({
    name: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBooking = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
};

const deleteBooking = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  deleteBooking,
};
