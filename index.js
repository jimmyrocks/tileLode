var express = require('express'),
    fs = require('fs'),
    request = require('request'),
    config = require('./config'),
    types = require('./types');

exports.routes = function() {
    app = express();
    app.get("/:layer/*", function appGet (req, res) {
        var layerConfig,
            cacheInfo;
        layerConfig = config.layers[req.param("layer")];
        if (layerConfig && types[layerConfig.type]) {
            cacheInfo = types[layerConfig.type].process(req, layerConfig);
        }
        if (cacheInfo) {
            getCache(cacheInfo, layerConfig, res);
        } else {
            res.status(404).send("Not Found");
        }
    });
    return app;
};

var getCache = function getCache(cacheInfo, layerConfig, res) {

    var createDirectories = function createDirectories(tilePath, cachePath, callback) {
        var testPaths = tilePath.split('/').concat(cachePath.split('/'));
        var checkDirectory = function checkDirectory(testPaths, innerCallback, index) {
            var testPath;
            index = index || 0;

            // Set this directory if the user adds './' as the root
            if (testPaths[0] === ".") {
                testPath = __dirname;
            } else {
                testPath = testPaths[0];
            }
            if (index > 0) {
                testPath = [testPath, testPaths.slice(1,index).join("/")].join("/");
            }

            if (index > testPaths.length - 1) {
                console.log("done loop");
                innerCallback(testPath);
            } else {
                fs.exists(testPath, function(exists) {
                    if (exists) {
                        checkDirectory(testPaths, innerCallback, index + 1);
                    } else {
                        fs.mkdir(testPath, 0777, function(err) {
                            if (!err) {
                                checkDirectory(testPaths, innerCallback, index + 1);
                            } else {
                                throw ("Error creating directory: " + err);
                            }
                        });
                    }
                });
            }
        };
        checkDirectory(testPaths, function(filename){
            console.log("fn: " + filename);
            callback(filename);
        });
    };

    var displayImage = function(filename) {

        // Write out the headers
        res.writeHead(200, {'Content-Type': 'image/jpeg'});

        // Check if the file exists
        fs.stat(filename, function(statErr) {
            if (!statErr) {

                // if so, open it and send it to the user
                var readStream = fs.createReadStream(filename);
                readStream.on('open', function() {
                    readStream.pipe(res);
                });
                readStream.on('error', function(readErr) {
                    res.end(err);
                });
            } else {

                // Otherwise, download it and stream it to the user
                var writeStream = fs.createWriteStream(filename);
                writeStream.on('error', function(writeError) {
                    console.log("write error: " + writeErr);
                });
                console.log("opening write stream!");
                var saveImage = request(cacheInfo.url);

                // Stream to file
                saveImage.pipe(writeStream);

                // Stream to the browser
                saveImage.pipe(res);
            }
        });
    };

    createDirectories(config.tilePath, cacheInfo.cachePath, function(img){
        displayImage(img);
    });
};

// This is just for debugging really
var toHtml = function toHtml(inVal) {
    var inReq = [];
    for (var val in inVal) {
        inReq.push(["<b>", val, "</b>", ": ", inVal[val]].join('')); 
    }
    return inReq.join("<br/>");
};
