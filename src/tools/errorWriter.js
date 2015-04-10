module.exports = {
  write: function(message, severity) {
    console.log('Error (Type ' + severity + '): ' + message);
    if (message.stack) console.log(message.stack);
  }
};
