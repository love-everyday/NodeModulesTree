'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1530841654820_1994';

  // add your config here
  config.middleware = [ 'compress' ];
  config.view = {
    mapping: {
      '.art': 'art',
    },
  };
  /*
  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: 'password',
      db: 0,
    },
  };
  */
  config.static = {
    maxAge: 365000,
    gzip: true,
  };
  config.compress = {
    threshold: 2048,
  };
  return config;
};
