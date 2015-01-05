var stream = require('stream'),
    spawn = require('child_process').spawn;

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

    var imArgs = ['-thumbnail', '512x512^'];
    var imConvert = function imConvert(args) {
        args.unshift("-");
        args.push(config.imageFormat + ":-");
        console.log(args);
        var im = spawn('convert', args);
        im.stdout.on('data', function imOnData(data) {
            res.write(data);
        });
        im.stdout.on('end', function imOnEnd(data) {
            res.end(data);
        });

        // These should all be set up to return a 404 or maybe a 504?
        im.on('close', function(code) {console.log("closed with code: " + code);});
        im.stderr.on('data', function(data) {console.log("convert.stderr: " + data);});
        im.on('error', function(err){console.log("convert err: " , err);});
        im.stdin.on('error', function(data) {console.log("convert.stdin error: ", data);});

        // Let everyone use this function!
        return im.stdin;
    };

    return {
        "url" :tileUrl,
        "cachePath" : urlParams.slice(1,5).join("/"),
        "res": res,
        "stream": imConvert(imArgs)
    };
};


