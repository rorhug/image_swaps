'use strict';

console.log("PhotoBomb server... STARTED")

//==============Modules

var express = require('express'),
    app = express();

app.configure(function(){
  app.use(express.json());
  app.use(express.urlencoded());
});

var mongoose = require('mongoose');

var request = require('request');

var u_ = require('underscore');

var Validator = require('validator').Validator
var sanitize = require('validator').sanitize;

//==============Functions

var exec = require('child_process').exec;
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

Validator.prototype.error = function (msg) {
  this._errors.push(msg);
  return this;
}

Validator.prototype.getErrors = function () {
  return;
}

//==============Database
mongoose.connect('mongodb://localhost/photo_share_dev');

var db = mongoose.connection;

db.on('error', function(){
  console.log("DATAbaSE ERR0r");
  process.kill();
});

db.once('open', function callback () {
  console.log("Database connected :P")
});

var mongoose = require('mongoose');
 
var linkPairSchema = mongoose.Schema({
  createdAt: Date,
  updatedAt: Date,
  swapId: String,
  webLinks: [{userDescription: String, webURL: String}]
});
 
var linkPair = mongoose.model('linkPair', linkPairSchema);

// Web server
app.use('/p', express.static(__dirname + '/public'));

app.get("/", function(req, res){
  res.sendfile("public/index.html");
});

app.post("/swap.json", function(req, res){
  res.setHeader('Content-Type', 'text/json');
  var postObj = JSON.parse(req.body.swap);
  var validator = new Validator();

  //Basic Validations
  
});

app.listen(3000);
