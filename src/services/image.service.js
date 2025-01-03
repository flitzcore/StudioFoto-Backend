const httpStatus = require('http-status');
const saltedMd5 = require('salted-md5');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');

const { Image } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

const firebaseConfig = {
  apiKey: 'API_KEY',
  authDomain: 'AuthDOmain',
  projectId: 'ProjectId',
  storageBucket: 'imagehost-425407.appspot.com',
  messagingSenderId: '572711905188',
  appId: 'APP_Id',
};
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp, config.storage.url);
/**
 * get image ref from url
 * @param {String} imgUrl
 * @returns {ref}
 */
const getImageRef = (imgUrl) => {
  const decodedUrl = decodeURIComponent(imgUrl);
  const pathRegex = /\/o\/(.*?)\?/;
  const match = pathRegex.exec(decodedUrl);

  if (!match) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Invalid URL: Unable to extract file path');
  }

  const filePath = match[1];
  return ref(storage, filePath);
};
/**
 * Uploads an image file and return url
 * @param {Object} file
 * @returns {Promise<Object>}
 */
const uploadFileToStorage = async (file) => {
  const timestamp = Date.now();
  const name = `${saltedMd5(file.originalname, 'SUPER-S@LT!')}.${timestamp}`;
  const metadata = {
    contentType: 'image/jpeg',
  };
  const imageRef = ref(storage, `img/${name}`);
  await uploadBytes(imageRef, file.buffer, metadata);
  const url = await getDownloadURL(imageRef);

  return url;
};
/**
 * Create a image
 * @param {Object} imageBody
 * @returns {Promise<Image>}
 */
const createImage = async (imageBody, file) => {
  const url = await uploadFileToStorage(file);
  const rawImage = {
    title: imageBody.title,
    caption: imageBody.caption,
    imgUrl: url,
  };
  return Image.create(rawImage);
};

/**
 * Query for images
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryImages = async (filter, options) => {
  const images = await Image.paginate(filter, options);
  return images;
};

/**
 * Get image by id
 * @param {ObjectId} id
 * @returns {Promise<Image>}
 */
const getImageById = async (id) => {
  return Image.findById(id);
};

/**
 * Get image by email
 * @param {string} email
 * @returns {Promise<Image>}
 */
const getImageByEmail = async (email) => {
  return Image.findOne({ email });
};

/**
 * Update image by id
 * @param {ObjectId} imageId
 * @param {Object} updateBody
 * @returns {Promise<Image>}
 */
const updateImageById = async (imageId, req) => {
  const updateBody = req.body;
  const image = await getImageById(imageId);
  let imageRefToDelete;
  if (!image) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Image not found');
  }
  const rawImage = updateBody;
  const file = req.files && req.files.file ? req.files.file[0] : null;

  if (file) {
    imageRefToDelete = getImageRef(image.imgUrl);
    const newUrl = await uploadFileToStorage(file);
    rawImage.imgUrl = newUrl;
  }
  Object.assign(image, updateBody);
  await image.save();
  if (imageRefToDelete) {
    await deleteObject(imageRefToDelete);
  }
  return image;
};

/**
 * Delete image by id
 * @param {ObjectId} imageId
 * @returns {Promise<Image>}
 */
const deleteImageById = async (imageId) => {
  const image = await getImageById(imageId);
  if (!image) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Image not found');
  }
  const imageRef = getImageRef(image.imgUrl);
  await image.remove();
  await deleteObject(imageRef);
  return image;
};

module.exports = {
  getImageRef,
  deleteObject,
  uploadFileToStorage,
  createImage,
  queryImages,
  getImageById,
  getImageByEmail,
  updateImageById,
  deleteImageById,
};
