const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createImage = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    tag: Joi.string(),
    caption: Joi.string().required(),
    file: Joi.string().required(),
  }),
};

const getImages = {
  query: Joi.object().keys({
    title: Joi.string(),
    tag: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getImage = {
  params: Joi.object().keys({
    imageId: Joi.string().custom(objectId),
  }),
};

const updateImage = {
  params: Joi.object().keys({
    imageId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      tag: Joi.string(),
      caption: Joi.string(),
      file: Joi.string(),
    })
    .min(1),
};

const deleteImage = {
  params: Joi.object().keys({
    imageId: Joi.string().custom(objectId),
  }),
};
const deleteAllImage = {
  query: Joi.object().keys({
    title: Joi.string().required(),
  }),
};
module.exports = {
  createImage,
  getImages,
  getImage,
  updateImage,
  deleteImage,
  deleteAllImage,
};
