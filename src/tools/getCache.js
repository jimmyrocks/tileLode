var fs = require('fs');
var config = require('../../config');
var request = require('request');
var imageTypes = require('./imageTypes');

module.exports = function(cacheInfo) {
  var createDirectories = function createDirectories(tilePath, cachePath, callback) {
    var testPaths = tilePath.split('/').concat(cachePath.split('/'));
    var checkDirectory = function checkDirectory(testPaths, innerCallback, index) {
      var testPath;
      index = index || 0;

      // Set this directory if the user adds './' as the root
      if (testPaths[0] === '.') {
        testPath = __dirname;
      } else {
        testPath = testPaths[0];
      }
      if (index > 0) {
        testPath = [testPath, testPaths.slice(1, index).join('/')].join('/');
      }

      if (index > testPaths.length - 1) {
        console.log('done loop');
        innerCallback(testPath);
      } else {
        fs.exists(testPath, function(exists) {
          var next = function next() {
            checkDirectory(testPaths, innerCallback, index + 1);
          };
          console.log('testing path: ' + testPath);
          if (exists) {
            next();
          } else {
            fs.mkdir(testPath, 0777, function(err) {
              if (!err) {
                next();
              } else {
                console.log('Error creating directory: ' + err);
                console.log(err);
                if (err.errno === 47) {
                  next();
                } else {
                  throw (err);
                }
              }
            });
          }
        });
      }
    };
    checkDirectory(testPaths, function(filename) {
      console.log('fn: ' + filename);
      callback(filename);
    });
  };

  var displayImage = function(filename) {

    // Write out the headers
    cacheInfo.res.writeHead(200, {
      'Content-Type': imageTypes[cacheInfo.imageFormat]
    });

    // Check if the file exists
    fs.stat(filename, function(statErr) {
      if (!statErr) {

        // if so, open it and send it to the user
        var readStream = fs.createReadStream(filename);
        readStream.on('open', function() {
          readStream.pipe(cacheInfo.stream);
        });
        readStream.on('error', function(readErr) {
          console.log(readErr);
          //cacheInfo.res.end(readErr);
        });
      } else {

        // Otherwise, download it and stream it to the user
        var writeStream = fs.createWriteStream(filename);
        writeStream.on('error', function(writeErr) {
          console.log('write error: ' + writeErr);
        });
        console.log('opening write stream!');
        var saveImage = request(cacheInfo.tileUrl);

        // Stream to file
        saveImage.pipe(writeStream);

        // Stream to the browser
        saveImage.pipe(cacheInfo.stream);

        cacheInfo.stream.on('error', function(readErr) {
          cacheInfo.res.end(readErr);
        });
      }
    });
  };

  if (cacheInfo.cacheTile) {
    createDirectories(config.tilePath, cacheInfo.cachePath, function(img) {
      displayImage(img);
    });
  } else {
    if (cacheInfo.tileUrl && !cacheInfo.errorDescription) {
      // do a 301 forward
      console.log(cacheInfo.tileUrl);
      cacheInfo.res.redirect(307, cacheInfo.tileUrl); //config.tileUrl);
    } else {
      //Tile Error
      /// PREDEFINED TILE ERROR PATH
      // sendError.sendError(cacheInfo.errorNum || 404, cacheInfo.res, cacheInfo.errorDescription);
    }
  }
};
