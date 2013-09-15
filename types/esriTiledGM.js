var streamify = require('streamify'),
    gm = require('gm'),
    fs = require('fs');

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

    // Graphicsmagick stuff
//    var g = gm();
    var imgReadStream = new streamify();
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
    imgReadStream.addDest(res);
/*
    gm(imgReadStream)
    .resize(128, 128)
    .stream(function(err, stdout, stderr){
//        stdout.pipe(res);
        //console.log(stderr);
    });
    };
    */
    return {
        "url" :tileUrl,
        "cachePath" : [urlParams[1], urlParams[2], urlParams[3], urlParams[4]].join("/"),
        "res": res,
        "stream": imgReadStream
    };
};


