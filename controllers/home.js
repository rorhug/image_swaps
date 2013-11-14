'use strict';

exports.index = function(req, res){
  res.sendfile("public/index.html");
};

exports.changes = function(req, res){
	res.type('application/json');
  res.sendfile(appConfig.appRoot + "/changelog.json");
};