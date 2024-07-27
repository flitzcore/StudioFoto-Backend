const httpStatus = require('http-status');
const { Service } = require('../models');
const ApiError = require('../utils/ApiError');
const { uploadFileToStorage, getImageRef, deleteObject } = require('./image.service');
/**
 * Create a subService for a specific service
 * @param {ObjectId} serviceId
 * @param {Object} subServiceBody
 * @returns {Promise<Service>}
 */
const createSubService = async (serviceId, subServiceBody, file) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }

  service.subService = service.subService || [];
  const url = await uploadFileToStorage(file);
  const rawService = {
    ...subServiceBody,
    imgUrl: url,
  };
  service.subService.push(rawService);
  await service.save();
  return service;
};

/**
 * Get all subServices for a specific service
 * @param {ObjectId} serviceId
 * @returns {Promise<Array>}
 */
const getSubServicesByServiceId = async (serviceId) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }
  return service.subService;
};

/**
 * Get subService by id
 * @param {ObjectId} serviceId
 * @param {ObjectId} subServiceId
 * @returns {Promise<Object>}
 */
const getSubServiceById = async (serviceId, subServiceId) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }
  const subService = service.subService.id(subServiceId);
  if (!subService) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubService not found');
  }
  return subService;
};

/**
 * Update subService by id
 * @param {ObjectId} serviceId
 * @param {ObjectId} subServiceId
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
const updateSubServiceById = async (serviceId, subServiceId, updateBody) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }
  const subService = service.subService.id(subServiceId);
  if (!subService) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubService not found');
  }

  Object.assign(subService, updateBody);
  await service.save();
  return subService;
};

/**
 * Delete subService by id
 * @param {ObjectId} serviceId
 * @param {ObjectId} subServiceId
 * @returns {Promise<void>}
 */
const deleteSubServiceById = async (serviceId, subServiceId) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }
  const subService = service.subService.id(subServiceId);
  if (!subService) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubService not found');
  }

  subService.remove();
  await service.save();
};

module.exports = {
  createSubService,
  getSubServicesByServiceId,
  getSubServiceById,
  updateSubServiceById,
  deleteSubServiceById,
};
