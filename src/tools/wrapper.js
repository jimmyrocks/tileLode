var resultWrapper = function(auth, callback) {
  //TODO: stuff
};

module.exports = function(router) {
  return {
    allow: function(method, path, format, auth, callback) {
      router[method](path + '.:format?', resultWrapper(auth, callback))
    }
  };
};
