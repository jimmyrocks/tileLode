var errorWriter = require('./src/tools/errorWriter'),
  express = require('express'),
  routes = require('./src/index'),
  wrapper = require('./src/tools/wrapper');

var expressApp = {
  'addRoutes': function(app, routes) {
    routes.map(function(route) {
      wrapper(app).allow(
        route.method,
        route.path,
        route.format,
        route.auth,
        route.process
      );
    });
    return app;
  },
  'createApp': function() {
    var app = express();

    // Error Logging
    process.on('uncaughtException', function(err) {
      errorWriter.write(err, 10);
    });

    return app;
  }
};

var returnFunction = {
  'createApp': function() {
    return expressApp.addRoutes(expressApp.createApp(), routes);
  },
  '_': expressApp
};
module.exports = returnFunction;
