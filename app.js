var express = require('express');
var wrapper = require('./src/tools/wrapper');
var errorWriter = require('./src/tools/errorWriter');
var routes = require('./src/index');

var expressApp = {
  'addRoutes': function(app, routes) {
    routes.map(function(route) {
      wrapper.allow(
        route.method,
        route.path,
        route.format,
        route.auth,
        route.process
      );
    });
  },
  'createApp': function(port) {
    var app = express();
    app.set('port', port || process.env.PORT || 3000);

    // Error Logging
    process.on('uncaughtException', function(err) {
      errorWriter.write(err, 10);
    });

    return app;
  }
};

express.addRoutes(expressApp.createApp(), routes);
