const httpStatus = require('http-status');
const { Service } = require('../models');
const ApiError = require('../utils/ApiError');
const { uploadFileToStorage, getImageRef, deleteObject } = require('./image.service');
/**
 * Create a service
 * @param {Object} serviceBody
 * @returns {Promise<Service>}
 */
const createService = async (serviceBody, file) => {
  const url = await uploadFileToStorage(file);
  const rawService = {
    ...serviceBody,
    imgUrl: url,
  };
  return Service.create(rawService);
};

/**
 * Query for services
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryServices = async (filter, options) => {
  const services = await Service.paginate(filter, options);
  return services;
};

/**
 * Get service by id
 * @param {ObjectId} id
 * @returns {Promise<Service>}
 */
const getServiceById = async (id) => {
  return Service.findById(id);
};

/**
 * Update service by id
 * @param {ObjectId} serviceId
 * @param {Object} updateBody
 * @returns {Promise<Service>}
 */
const updateServiceById = async (serviceId, req) => {
  const updateBody = req.body;
  const service = await getServiceById(serviceId);
  let imageRefToDelete;
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }
  const rawService = updateBody;
  const file = req.files && req.files.file ? req.files.file[0] : null;

  if (file) {
    imageRefToDelete = getImageRef(service.imgUrl);
    const newUrl = await uploadFileToStorage(file);
    rawService.imgUrl = newUrl;
  }
  Object.assign(service, updateBody);
  await service.save();
  if (imageRefToDelete) {
    await deleteObject(imageRefToDelete);
  }
  return service;
};

/**
 * Delete service by id
 * @param {ObjectId} serviceId
 * @returns {Promise<Service>}
 */
const deleteServiceById = async (serviceId) => {
  const service = await getServiceById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }
  await service.remove();
  return service;
};

module.exports = {
  createService,
  queryServices,
  getServiceById,
  updateServiceById,
  deleteServiceById,
};
