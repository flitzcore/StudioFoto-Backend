const express = require('express');
const imageRoute = require('./image.route');
const bookingRoute = require('./booking.route');
const webhookRoute = require('./webhook.route');
const docsRoute = require('./docs.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const serviceRoute = require('./service.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/images',
    route: imageRoute,
  },
  {
    path: '/booking',
    route: bookingRoute,
  },
  {
    path: '/hook',
    route: webhookRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/service',
    route: serviceRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
