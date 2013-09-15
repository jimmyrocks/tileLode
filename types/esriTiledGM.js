var stream = require('stream'),
    spawn = require('child_process').spawn,
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

    // Do some image magick!
    //var args = ['-', 'gif:-'];
    var args = ['-', '-thumbnail', '512x512^', '-'];
    var convert = spawn('convert ' + args.join(' '), []);
    var imgReadStream = convert.stdin;
    res.writeHead(200, {'Content-Type': 'image/gif'});
    convert.stdout.on('data', function(data) {
        console.log("y");
        console.log(data);
        res.write(data);
    });
    convert.stdout.on('end', function(data) {
        console.log("z");
        console.log(data);
        res.end(data);
    });

    convert.on('close', function(code) {console.log("closed with code: " + code);});
    convert.stderr.on('data', function(data) {console.log("convert.stderr: " + data);});
    convert.on('error', function(err){console.log("convert err: " , err);});
    convert.stdin.on('error', function(data) {console.log("convert.stdin error: ", data);});

    return {
        "url" :tileUrl,
        "cachePath" : [urlParams[1], urlParams[2], urlParams[3], urlParams[4]].join("/"),
        "res": res,
        "stream": imgReadStream
    };
};


