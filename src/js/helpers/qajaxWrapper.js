var qajax = require("qajax");

var qajaxWrapper = function (options) {
  var response = {
    status: null,
    body: null
  };
  // Translate Oboe options to qajax equivalent
  var oboeDictionary = {
    "body": "data"
  };
  Object.keys(options).forEach((key) => {
    if (oboeDictionary.hasOwnProperty(key)) {
      Object.defineProperty(
        options,
        oboeDictionary[key],
        Object.getOwnPropertyDescriptor(options, key)
      );
      delete options[key];
    }
  });

  var api = qajax(options);
  api.error = function (callback) {
    var promise = this;
    // Bind callback also for non 200 status
    promise.then(
      // not a 2* response
      function (xhr) {
        if (xhr.status.toString().match(/^[^2]/)) {
          response.status = xhr.status;
          try {
            response.body = JSON.parse(xhr.responseText);
          } catch (e) {
            response.body = xhr.responseText;
          }
          callback(response);
        }
      },
      // the promise is only rejected if the server has failed
      // to reply to the client (network problem or timeout reached).
      function (xhr) {
        response.status = xhr.status;
        try {
          response.body = JSON.parse(xhr.responseText);
        } catch (e) {
          response.body = xhr.responseText;
        }
        callback(response);
      }
    );
    return promise;
  };

  api.success = function (callback) {
    var promise = this;
    promise
      .then(qajax.filterStatus(function (status) {
        return status.toString().match(/^2/);
      }))
      .then(function (xhr) {
        response.status = xhr.status;
        try {
          response.body = JSON.parse(xhr.responseText);
        } catch (e) {
          response.body = xhr.responseText;
        }
        callback(response);
      });
    return promise;
  };

  return api;
};

module.exports = qajaxWrapper;
