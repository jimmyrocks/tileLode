var resultWrapper = function(auth, callback) {
  //TODO: stuff
  return callback;
};

module.exports = function(router) {
  return {
    allow: function(method, path, format, auth, callback) {
      router[method.toLowerCase()](path + '.:format?', resultWrapper(auth, callback));
    }
  };
};
