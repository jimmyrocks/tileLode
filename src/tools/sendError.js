// Sends error to the browser
// http://en.wikipedia.org/wiki/List_of_HTTP_status_codes

var errorList = require('./errorList');
module.exports = function(errorType, res, description) {
  var returnLines = [];
  // Create a description page
  if (errorList[errorType]) {
    returnLines.push('<h1>' + errorType + ': ' + errorList[errorType] + '</h1>');
  } else {
    returnLines.push('<h1> Error: ' + errorType + '</h1>');
  }
  if (description) {
    returnLines.push('<hr><h4><span style="color:dd0000;">Description:</span> ' + description + '</h4>');
  }
  res.status(errorType).send(returnLines.join(''));
};
