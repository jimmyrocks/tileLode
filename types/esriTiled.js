exports.process = function process (req, res, config) {
    var z,
        x,
        y,
        tileUrl,
        urlParams;

    urlParams = req.url.replace(/[^0-9a-zA-Z]/g, "/").split('/');
    if (urlParams.length > 3) {
        // We have enough params
        z = urlParams[2];
        x = urlParams[3];
        y = urlParams[4];

        tileUrl = config.url.replace("%z",z);
        tileUrl = tileUrl.replace("%x",x);
        tileUrl = tileUrl.replace("%y",y);
    }
    return {
        "url" :tileUrl,
        "cachePath" : [urlParams[1], urlParams[2], urlParams[3], urlParams[4]].join("/"),
        "res": res,
        "stream": res
    };
};


