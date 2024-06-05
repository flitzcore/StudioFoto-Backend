const httpStatus = require('http-status');

const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const catchAsync = require('../utils/catchAsync');
const { imageService } = require('../services');

const createImage = catchAsync(async (req, res) => {
  const file = req.files.file[0];
  const image = await imageService.createImage(req.body, file);
  res.status(httpStatus.CREATED).send(image);
});

const getImages = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await imageService.queryImages(filter, options);
  res.send(result);
});

const getImage = catchAsync(async (req, res) => {
  const image = await imageService.getImageById(req.params.imageId);
  if (!image) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Image not found');
  }
  res.send(image);
});

const updateImage = catchAsync(async (req, res) => {
  const image = await imageService.updateImageById(req.params.imageId, req);
  res.send(image);
});

const deleteImage = catchAsync(async (req, res) => {
  await imageService.deleteImageById(req.params.imageId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createImage,
  getImages,
  getImage,
  updateImage,
  deleteImage,
};
