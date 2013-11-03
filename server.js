'use strict';

console.log("PhotoBomb server... STARTED")

//==============Modules

var express = require('express'),
    app = express();

app.use(express.bodyParser());

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

function ers(error_list)
{
  return JSON.stringify({errors: error_list})
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
  webLinks: [{userDescription: String, webURL: String, ipAddress: String}]
});
 
var LinkPair = mongoose.model('LinkPair', linkPairSchema);

//==============Web server
app.use('/p', express.static(__dirname + '/public'));

app.get("/", function(req, res){
  res.sendfile("public/index.html");
});

app.post("/swap.json", function(req, res){
  var timestamp = new Date;
  console.log("===/post.json=== at:", timestamp)

  res.setHeader('Content-Type', 'text/json');
  var ip = req.connection.remoteAddress;
  console.log(ip);

  // Post object is a json string in the form of:
  // {"desc": "cool cat", "url": "http://imgur.com/catpic"}
  try
  {
    var postObj = JSON.parse(req.body.swap);
  }
  catch(e)
  {
    res.end(ers(["bad data"]));
    return; // Exit when the information is not parsable
  }

  var v = new Validator();

  // Basic Validations
  v.check(postObj.desc, "Description must be between 1 and 250 characters").len(1, 250);
  v.check(postObj.url).isUrl();

  if(v._errors.length == 0)
  {
    // Get database record with no second image in pair
    LinkPair.findOne({webLinks: {$size: 1}}, function(err, obj){
      if (err)
      {
        res.end(er(["Database query error"]));
        return handleError(err);
      }
      if(obj)
      {
        console.log("existing");
        obj.webLinks.push({
          userDescription: postObj.desc,
          webURL: postObj.url,
          ipAddress: ip
        });
        obj.save(function (err, product, numberAffected) {
          if (err) {
            res.end(er(["Error saving"]));
            return handleError(err);
          }

          res.end(JSON.stringify(obj));
        });
      }else{
        console.log("new");
        var newPair = new LinkPair({webLinks:[{
                                               userDescription: postObj.desc,
                                               webURL: postObj.url,
                                               ipAddress: ip
                                             }],
                                    createdAt: timestamp
                                  });
        newPair.save(function (err, newPairSaved, numberAffected) {
          if (err) {
            res.end(er(["Error saving"]));
            return handleError(err);
          }

          res.end(JSON.stringify(newPairSaved));
        });
      }
    });
  }else{
    // Send validation errors
    res.end(ers(v._errors));
  }

  // res.end(ers(["unknowen error"]));
  
});

app.post("/poll.json", function(req, res){
  var timestamp = new Date;
  console.log("===/post.json=== at:", timestamp)

  res.setHeader('Content-Type', 'text/json');
  var ip = req.connection.remoteAddress;
  console.log(ip);

  //get the swap id url param
  var suppliedPairId = req.query.swap_id;

  var v = new Validator();
  // Check if it is a 24 character mongo object id
  v.check(postObj.desc, "Description must be between 1 and 250 characters").len(1, 250);

});

app.listen(3000);
