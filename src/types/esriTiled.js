

exports.process = function process (req, res, config) {
    var z,
        x,
        y,
        urlParams = req.url.replace(/[^0-9a-zA-Z]/g, "/").split('/'),
        tileObject = {
            "tileUrl": null,
            "cachePath": null,
            "cacheTile": false,
            "returnTile": false,
            "res": res,
            "stream": res,
            "imageFormat": config.imageFormat
        };

    if (urlParams.length > 4) {
        // We have enough params
        z = urlParams[2];
        x = urlParams[3];
        y = urlParams[4];

        tileObject.tileUrl = config.url.replace("%z",z);
        tileObject.tileUrl = tileObject.tileUrl.replace("%x",x);
        tileObject.tileUrl = tileObject.tileUrl.replace("%y",y);
        tileObject.cachePath = urlParams.splice(1,5).join("/");

        // If we're not in the right zoom, return false for the tileUrl
        if (z >= parseInt(config.minZoom,10) && z <= parseInt(config.maxZoom, 10)) {
            tileObject.cacheTile = config.cacheTiles;
            tileObject.returnTile = true;
        } else {
            tileObject.errorDescription = [
                "The zoom level of (",
                z,
                ") is not between the minZoom (",
                config.minZoom,
                ") and the maxZoom (",
                config.maxZoom,
                ")."
            ].join('');
        }
    } else {
        tileObject.errorDescription = "Too few parameters, this requires parameters in z/x/y format";
    }
    return tileObject;
};


