var tileMath = require('../tools/tileMath');
var Datawrap = require('datawrap');

var query = ['SELECT St_AsJPEG(st_resize(st_union(st_clip(a.rast,ST_MakeEnvelope({{left}}, {{bottom}}, {{right}}, {{top}}, 3857),9999,true)),256,256)) rast FROM (',
  'SELECT rast FROM nj_princeton_255342_1894_62500_geo UNION ALL',
  'SELECT rast FROM nj_somerville_255380_1891_62500_geo UNION ALL',
  'SELECT rast FROM "nj_high bridge_255221_1890_62500_geo" UNION ALL',
  'SELECT rast FROM nj_lambertville_255237_1890_62500_geo',
  ') a WHERE a.rast && ',
  'ST_MakeEnvelope({{left}}, {{bottom}}, {{right}}, {{top}}, 3857)'
].join(' ');

var openTileStream = function(config, params, callback) {
  console.log('d0');
  var database = new Datawrap(config.database);
  console.log(params);
  database.runQuery(query, params, function(e, r) {
    if (e) {
      console.log('d1');
      callback(e, null);
    } else {
      console.log('d2');
      // Get the image from here and put it into a stream
      console.log(r[0].result.rows.length);

      callback(null, r);
    }
  });
};

exports.process = function process(req, res, config, callback) {
  var z,
    x,
    y,
    urlParams = req.url.replace(/[^0-9a-zA-Z]/g, '/').split('/'),
    tileObject = {
      'cachePath': null,
      'cacheTile': false,
      'returnTile': false,
      'res': res,
      'stream': res,
      'sourceStream': null,
      'imageFormat': config.imageFormat
    };
  console.log('a1', config);

  if (urlParams.length > 4) {
    // We have enough params
    z = parseInt(urlParams[2], 10);
    x = parseInt(urlParams[3], 10);
    y = parseInt(urlParams[4], 10);

    // Set default postgresql settings
    var postgresqlSettings = {
      'dpi': '92',
      'layers': 'show:0',
      'size': '256,256',
      'sizeX': '256',
      'sizeY': '256',
      'f': 'image',
      'format': config.imageFormat,
      'bboxSR': '4326',
      'imageSR': '3857',
      'left': tileMath.toWebMercator(tileMath.tile2long(x, z), tileMath.tile2lat(y, z)).lon,
      'top': tileMath.toWebMercator(tileMath.tile2long(x, z), tileMath.tile2lat(y, z)).lat,
      'right': tileMath.toWebMercator(tileMath.tile2long((x + 1), z), tileMath.tile2lat((y + 1), z)).lon,
      'bottom': tileMath.toWebMercator(tileMath.tile2long((x + 1), z), tileMath.tile2lat((y + 1), z)).lat
    };

    // postgresqlSettings.bbox = [bounds.left, bounds.top, bounds.right, bounds.bottom].join(',');
    // postgresqlSettings.bounds = bounds;

    // If we're not in the right zoom, return false for the tileUrl
    if (z >= parseInt(config.minZoom, 10) && z <= parseInt(config.maxZoom, 10)) {
      console.log('b0');
      tileObject.cacheTile = config.cacheTiles;
      tileObject.returnTile = true;
      openTileStream(config, postgresqlSettings, function(e, r) {
        if (e) {
          callback(e);
        } else {
          var Readable = require('stream').Readable;
          tileObject.sourceStream = new Readable();
          tileObject.sourceStream.push(r[0].result.rows[0].rast);
          tileObject.sourceStream.push(null);
          callback(null, tileObject);
        }
      });
    } else {
      console.log('b1');
      tileObject.errorDescription = [
        'The zoom level of (',
        z,
        ') is not between the minZoom (',
        config.minZoom,
        ') and the maxZoom (',
        config.maxZoom,
        ').'
      ].join('');
      tileObject.errorNum = 400;
    }
  } else {
    tileObject.errorDescription = 'Too few parameters, this requires parameters in z/x/y format';
    tileObject.errorNum = 400;
  }
  if (!tileObject.returnTile) {
    callback(null, tileObject);
  }
};
