'use strict';

console.log("PHOTO SHARE server... STARTED")

//==============Modules

var express = require('express'),
    app = express();

app.use(express.bodyParser());

var mongoose = require('mongoose');

var request = require('request');

var u_ = require('underscore');

//==============Functions

var exec = require('child_process').exec;
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

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
  title: String,
  webLinks: [{userName: String, webURL: String}]
});
 
var linkPair = mongoose.model('linkPair', projectSchema);

