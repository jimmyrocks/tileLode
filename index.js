var express = require('express'),
    fs = require('fs'),
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
            res.send(getCache(cacheInfo, layerConfig));
        } else {
            res.status(404).send("Not Found");
        }

    });
    return app;
};

var getCache = function getCache(cacheInfo, layerConfig) {
    
    var createDirectories = function createDirectories(tilePath, cachePath, callback) {
        var testPaths = tilePath.split('/').concat(cachePath.split('/'));
        var checkDirectory = function checkDirectory(testPaths, innerCallback, index) {
            var testPath;
            index = index || 0;
            if (index > testPaths.length - 1) {
                console.log("done");
                innerCallback();
            } else {
                testPath = testPaths[0];
                if (index > 0) {
                    testPath = [testPath, testPaths.slice(1,index).join("/")].join("/");
                }
                console.log(testPath);
                fs.exists(testPath, function(exists) {
                    if (exists) {
                        checkDirectory(testPaths, innerCallback, index + 1);
                    } else {
                        fs.mkdir(testPath, function() {
                            checkDirectory(testPaths, innerCallback, index + 1);
                        });
                    }
                });
                //checkDirectory(testPaths, innerCallback, index + 1);
            }
        };
        checkDirectory(testPaths, callback);
    };

    createDirectories(config.tilePath, cacheInfo.cachePath, function(){});

    var testPath = config.tilePath;

    return (toHtml(cacheInfo));
};

// This is just for debugging really
var toHtml = function toHtml(inVal) {
    var inReq = [];
    for (var val in inVal) {
        inReq.push(["<b>", val, "</b>", ": ", inVal[val]].join('')); 
    }
    return inReq.join("<br/>");
};
