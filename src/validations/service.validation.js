const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createService = {
  body: Joi.object().keys({
    title: Joi.string().required().trim(),
    subtitle: Joi.string().required().trim(),
    description: Joi.string().required().trim(),
    price: Joi.number().required(),
    img: Joi.string(),
    condition: Joi.array().items(Joi.string().trim()).default([]),
    addon: Joi.array().items(Joi.string().trim()).default([]),
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
      subtitle: Joi.string().trim(),
      description: Joi.string().trim(),
      price: Joi.number(),
      condition: Joi.array().items(Joi.string().trim()),
      addon: Joi.array().items(Joi.string().trim()),
      file: Joi.string(),
    })
    .min(1), // Ensure at least one field is being updated
};

const deleteService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
};
