const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { serviceService } = require('../services');

const createService = catchAsync(async (req, res) => {
  const service = await serviceService.createService(req.body);
  res.status(httpStatus.CREATED).send(service);
});

const getServices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'description', 'minPrice', 'maxPrice']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await serviceService.queryServices(filter, options);
  res.send(result);
});

const getService = catchAsync(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }
  res.send(service);
});

const updateService = catchAsync(async (req, res) => {
  const service = await serviceService.updateServiceById(req.params.serviceId, req.body);
  res.send(service);
});

const deleteService = catchAsync(async (req, res) => {
  await serviceService.deleteServiceById(req.params.serviceId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteAllServices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await serviceService.queryServices(filter, options);

  if (result) {
    // Iterate over each service and delete it by its ID
    await Promise.all(
      result.results.map(async (service) => {
        await serviceService.deleteServiceById(service.id);
      })
    );
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'No services found');
  }

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  deleteAllServices,
};
