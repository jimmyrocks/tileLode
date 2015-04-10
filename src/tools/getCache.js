var fs = require('fs');
var config = require('../../config');
var mkdirp = require('mkdirp');
var request = require('request');
var imageTypes = require('./imageTypes');
var sendError = require('./sendError');

var createDirectories = function createDirectories(tilePath, cachePath, callback) {
  var testPaths = tilePath.split('/').concat(cachePath.split('/'));
  var makeDirectory = function(filepath, dirCallback) {
    // Clean up filepath
    // Replace '.' with the dirname
    filepath = filepath.map(function(v) {
      return v === '.' ? __dirname : v;
    });

    // Make the dir if we need it
    mkdirp(filepath.slice(0, -1).join('/'), function(err) {
      if (err) {
        throw err;
      } else {
        dirCallback(filepath.join('/'));
      }
    });
  };

  makeDirectory(testPaths, function(filename) {
    callback(filename);
  });
};

var saveImage = function(inStream, outStreams) {
  return outStreams.map(function(stream) {
    stream.on('error', function(err) {
      throw err;
    });
    return stream ? inStream.pipe(stream) : null;
  });
};

var returnImage = function(filename, cacheInfo) {

  // Write out the headers
  cacheInfo.res.writeHead(200, {
    'Content-Type': imageTypes[cacheInfo.imageFormat]
  });

  // Check if the file exists
  var outStreams, fileStream, inStream;
  inStream = cacheInfo.sourceStream || request(cacheInfo.tileUrl);
  outStreams = [cacheInfo.stream];

  if (filename) {
    fs.stat(filename, function(statErr) {
      if (!statErr) {
        // if so, open it and send it to the user
        fileStream = fs.createReadStream(filename);
        fileStream.on('open', function() {
          outStreams.map(function(stream) {
            fileStream.pipe(stream);
          });
        });
        fileStream.on('error', function(readErr) {
          throw readErr;
        });
      } else {
        outStreams.push(fs.createWriteStream(filename));
        saveImage(inStream, outStreams);
      }
    });
  } else {
    saveImage(inStream, outStreams);
  }
};

module.exports = function(cacheInfo) {
  if (cacheInfo.cacheTile) {
    createDirectories(config.tilePath, cacheInfo.cachePath, function(path) {
      returnImage(path, cacheInfo);
    });
  } else {
    if (cacheInfo.tileUrl && !cacheInfo.errorDescription) {
      // do a 307 redirect
      cacheInfo.res.redirect(307, cacheInfo.tileUrl); //config.tileUrl);
    } else if (cacheInfo.sourceStream && !cacheInfo.errorDescription) {
      // Tile has its own stream to use
      returnImage(null, cacheInfo);
    } else {
      //Tile Error
      /// PREDEFINED TILE ERROR PATH
      sendError(cacheInfo.errorNum || 404, cacheInfo.res, cacheInfo.errorDescription);
      throw cacheInfo.errorDescription;
    }
  }
};
