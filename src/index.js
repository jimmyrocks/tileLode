var config = require('../config');
var getCache = require('./tools/getCache');
var sendError = require('./tools/sendError');
var types = require('./types');

module.exports = [{
  'description': 'Displays the information pertaining to this particular cache entry',
  'method': 'get',
  'name': 'cache information',
  'path': '/:layer/*',
  'process': function(req, res) {
    var layerConfig = config.layers[req.param('layer')];
    if (layerConfig && types[layerConfig.type]) {
      types[layerConfig.type].process(req, res, layerConfig, function(e, cacheInfo) {
        if (e) throw e;
        getCache(cacheInfo);
      });
    } else {
      sendError(500, res, 'No Cache For Image');
    }
  }
}];
