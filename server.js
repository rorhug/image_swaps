'use strict';

console.log("ImageSwaps server... STARTED")


//==============Modules

var express = require('express'),
    app = express();

app.use(express.bodyParser());
app.use(express.logger());

var mongoose = require('mongoose');

// var request = require('request');

var _ = require('underscore');

var Validator = require('validator').Validator
var sanitize = require('validator').sanitize;

var toobusy = require('toobusy');
 
// middleware which blocks requests when too busy
app.use(function(req, res, next) {
  if (toobusy()) {
    res.send(503, "I'm busy right now, sorry.");
  } else {
    next();
  } 
});

process.on('SIGINT', function() {
  server.close();
  // calling .shutdown allows the process to exit normally
  toobusy.shutdown();
  process.exit();
});

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

function swapResString(o, status)
{
  var links = _.map(o.webLinks, function(liO){return {desc:     liO.userDescription,
                                                  url:      liO.webURL,
                                                  original: liO.original}
                                         });
  return JSON.stringify({
    swapID: o._id,
    pollStatus: status,
    links: links 
  })
}

//==============Database
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/image_swaps');

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
  swapID: String,
  webLinks: [{userDescription: String, webURL: String, ipAddress: String, original: Boolean}]
});
 
var LinkPair = mongoose.model('LinkPair', linkPairSchema);

//==============Web server
app.get("/", function(req, res){
  res.sendfile("public/index.html");
});

app.post("/swap.json", function(req, res){
  var timestamp = new Date;

  res.setHeader('Content-Type', 'text/json');
  var ip = req.connection.remoteAddress;

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
    // TODO Don't look for ones with same image link
    LinkPair.findOne({webLinks: {$size: 1}}, function(err, obj){
      if (err)
      {
        res.end(er(["Database query error"]));
        return handleError(err);
      }
      if(obj)
      {
        obj.webLinks.push({
          userDescription: postObj.desc,
          webURL: postObj.url,
          ipAddress: ip,
          original: false
        });
        obj.save(function (err, product, numberAffected) {
          if (err) {
            res.end(er(["Error saving"]));
            return handleError(err);
          }

          res.end(swapResString(obj._doc, 2));
        });
      }else{
        var newPair = new LinkPair({webLinks:[{
                                               userDescription: postObj.desc,
                                               webURL: postObj.url,
                                               ipAddress: ip,
                                               original: true
                                             }],
                                    createdAt: timestamp
                                  });
        newPair.save(function (err, newPairSaved, numberAffected) {
          if (err) {
            res.end(er(["Error saving"]));
            return handleError(err);
          }

          res.end(swapResString(newPairSaved._doc, 1));
        });
      }
    });
  }else{
    // Send validation errors
    res.end(ers(v._errors));
  }
  
});

app.post("/poll.json", function(req, res){
  var timestamp = new Date;

  res.setHeader('Content-Type', 'text/json');
  var ip = req.connection.remoteAddress;

  //get the swap id url param
  var suppliedPairId = req.query.swap_id;

  var v = new Validator();
  // Check if it is a 24 character mongo object id
  v.check(suppliedPairId, "Invalid swap pair id").len(24, 24);

  if(v._errors.length == 0)
  {
    LinkPair.findById(suppliedPairId, function(err, obj){
      if (err)
      {
        res.end(er(["Database query error"]));
        return handleError(err);
      }
      if (obj)
      {
        var polStat = obj.webLinks.length == 1 ? 1 : 2;
        res.end(swapResString(obj._doc, polStat));
      }else{
        var errorObj = {pollStatus: 0, errors: ["Unable to find swap pair"]};
        res.end(JSON.stringify(errorObj));
      }
    });
  }else{
    // Send validation errors
    res.end(ers(v._errors));
  }

});

//Static files
app.use('/', express.static(__dirname + '/public'));

var port = process.env.PORT || 3000;
app.listen(port);