var config = require('../../config'),
  spawn = require('child_process').spawn;


exports.imConvert = function imConvert(args, res) {

  // Add the streaming options
  args.unshift('-');
  args.push(config.imageFormat + ':-');

  // Spawn the process
  var im = spawn('convert', args);

  // Set up the writes to the browser
  im.stdout.on('data', function imOnData(data) {
    res.write(data);
  });
  im.stdout.on('end', function imOnEnd(data) {
    res.end(data);
  });

  // These will all return a 500 error
  im.stderr.on('data', function(data) {
    console.log('convert.stderr: ' + data);
  });
  im.on('error', function(err) {
    console.log('convert err: ', err);
  });
  im.stdin.on('error', function(data) {
    console.log('convert.stdin error: ', data);
  });

  // Return a single stdin so streams can be sent here
  return im.stdin;
};
