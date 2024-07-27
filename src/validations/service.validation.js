const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createService = {
  body: Joi.object().keys({
    title: Joi.string().required().trim(),
    description: Joi.string().required().trim(),
    file: Joi.string(),
  }),
};

const getServices = {
  query: Joi.object().keys({
    title: Joi.string().trim(),
    description: Joi.string().trim(),
    minPrice: Joi.number(),
    maxPrice: Joi.number(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId),
  }),
};

const updateService = {
  params: Joi.object().keys({
    serviceId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim(),
      description: Joi.string().trim(),
      file: Joi.string(),
    })
    .min(1), // Ensure at least one field is being updated
};

const deleteService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId),
  }),
};

// SubService validation
const createSubService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    title: Joi.string().required().trim(),
    addon: Joi.string().trim(),
    condition: Joi.string().trim(),
    file: Joi.string(),
    price: Joi.number().integer(),
  }),
};

const getSubServices = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId).required(),
  }),
};

const getSubService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId).required(),
    subServiceId: Joi.string().custom(objectId).required(),
  }),
};

const updateSubService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId).required(),
    subServiceId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim(),
      addon: Joi.string().trim(),
      condition: Joi.string().trim(),
      file: Joi.string(),
      price: Joi.number().integer(),
    })
    .min(1), // Ensure at least one field is being updated
};

const deleteSubService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId).required(),
    subServiceId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  createSubService,
  getSubServices,
  getSubService,
  updateSubService,
  deleteSubService,
};
