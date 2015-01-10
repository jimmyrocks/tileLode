var config = require('../config');
var getCache = require('./tools/getCache');
var sendError = require('./tools/sendError');
var types = require('./types');

module.exports = [{
  'description': 'Displays the leaflet window, used for testing',
  'method': 'get',
  'name': 'leaflet test display',
  'path': '/',
  'process': function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
  }
}, {
  'description': 'Displays the information pertaining to this particular cache entry',
  'method': 'get',
  'name': 'cache information',
  'path': '/:layer/*',
  'process': function(req, res) {
    var cacheInfo, layerConfig = config.layers[req.param('layer')];
    cacheInfo = layerConfig && types[layerConfig.type] ? types[layerConfig.type].process(req, res, layerConfig) : null;
    if (cacheInfo) {
      getCache(cacheInfo);
    } else {
      sendError.sendError(500, res, 'No Cache For Image');
    }
  }
}];
