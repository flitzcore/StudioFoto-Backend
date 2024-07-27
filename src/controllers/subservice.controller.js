const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { subServiceService } = require('../services');

// SubService Controllers

const createSubService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const file = req.files.file[0];
  const subService = await subServiceService.createSubService(serviceId, req.body, file);
  res.status(httpStatus.CREATED).send(subService);
});

const getSubServices = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const subServices = await subServiceService.getSubServicesByServiceId(serviceId);
  res.send(subServices);
});

const getSubService = catchAsync(async (req, res) => {
  const { serviceId, subServiceId } = req.params;
  const subService = await subServiceService.getSubServiceById(serviceId, subServiceId);
  if (!subService) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubService not found');
  }
  res.send(subService);
});

const updateSubService = catchAsync(async (req, res) => {
  const { serviceId, subServiceId } = req.params;
  const subService = await subServiceService.updateSubServiceById(serviceId, subServiceId, req.body);
  res.send(subService);
});

const deleteSubService = catchAsync(async (req, res) => {
  const { serviceId, subServiceId } = req.params;
  await subServiceService.deleteSubServiceById(serviceId, subServiceId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubService,
  getSubServices,
  getSubService,
  updateSubService,
  deleteSubService,
};
