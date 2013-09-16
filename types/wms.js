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

    if (urlParams.length > 3) {
        // We have enough params
        z = parseInt(urlParams[2],10);
        x = parseInt(urlParams[3],10);
        y = parseInt(urlParams[4],10);

        // Set default wmsSettings
        var wmsSettings = {
            "dpi": "92",
            "transparent":  true,
            "layers": "show:0",
            "size": "256,256",
            "f": "image",
            "format": config.imageFormat,
            "bboxSR": "4326",
            "imageSR": "102113"
        };

        
        var bounds = {
            'left': tile2long(x,z),
            'top': tile2lat(y,z),
            'right': tile2long((x+1), z),
            'bottom': tile2lat((y+1),z)
        };

        wmsSettings.bbox = [bounds.left, bounds.top, bounds.right, bounds.bottom].join(",");

        // Add in params from the config (not ready yet!)
        if (config.wms) {
            for (var setting in config.wms) {
                if (config.wms.hasOwnProperty(setting)){
                    wmsSettings[setting] = config.wms[setting];
                }
            }
        }
        tileObject.tileUrl = config.url;
        for (var key in wmsSettings) {
            if (wmsSettings.hasOwnProperty(key)){
                tileObject.tileUrl += key + "=" + encodeURIComponent(wmsSettings[key]) + "&";
            }
        }
        // Remove last character and URL encode the url
        tileObject.tileUrl = tileObject.tileUrl.substring(0,tileObject.tileUrl.length-1);
        console.log("displayable URL ", tileObject.tileUrl);
        tileObject.cachePath = urlParams.splice(1,5).join("/");

        // If we're not in the right zoom, return false for the tileUrl
        console.log("zoom, min, max: ", z, config.minZoom, config.maxZoom);
        if (z >= parseInt(config.minZoom,10) && z <= parseInt(config.maxZoom, 10)) {
        console.log("%zoom, min, max: ", z, config.minZoom, config.maxZoom);
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

// Figure out the coords
        function tile2long(xt,zt) {
            return (xt/Math.pow(2,zt)*360-180);
        }
        function tile2lat(yy,zy) {
            var n=Math.PI-2*Math.PI*yy/Math.pow(2,zy);
            return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
        }

