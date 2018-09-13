'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/show', controller.show.index);
  router.get('/open', controller.open.index);
  router.get('/search', controller.search.index);
};
