'use strict';

console.log("ImageSwaps server... STARTED")

//==============Modules

var express = require('express'),
    app = express();

app.use(express.bodyParser());
app.use(express.logger());

var mongoose = require('mongoose');

var request = require('request');

var _ = require('underscore');

var Validator = require('validator').Validator;
var sanitize = require('validator').sanitize;

var crypto = require('crypto');

var toobusy = require('toobusy');

var url = require("url");

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

//==============Functions/Vars

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

// EXPERIMENTAL image proxying feature for where imgur etc. is firewalled
// var proxyIPs = process.env.PROXY_IPS ? process.env.PROXY_IPS.split("-") : [];
// var proxyIPs = ["127.0.0.1"];
// var proxyDomains = ["i.imgur.com"];

function swapResString(o, status, ip)
{
  var links = _.map(o.webLinks, function(liO){
    // var useProxy = _.contains(proxyIPs, ip) && _.contains(proxyDomains, url.parse(liO.webURL).host);
    return {
      desc:     liO.userDescription,
      // url:      useProxy ? "localhost:3000/proxyimage?imageurl=" + liO.webURL : liO.webURL,
      url: liO.webURL,
      original: liO.original
    }
  });
  return JSON.stringify({
    swapID: o.swapID,
    pollStatus: status,
    links: links 
  })
}

function sha1(x){
  var shasum = crypto.createHash('sha1');
  shasum.update(x);
  return shasum.digest('hex');
}

var salt = process.env.SWAP_ID_SALT || "omgg2gktnxbai";

console.log("Salt is: " + salt);

var imageMimeTypes = ["image/gif",
                      "image/jpeg",
                      "image/pjpeg",
                      "image/png",
                      "image/svg+xml",
                      "image/svg",
                      "image/tiff",
                      "image/webp",
                      "image/x-icon",
                      "image/ico",
                      "image/bmp"]

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

app.get("/changes.json", function(req, res){
  res.type('application/json');
  res.sendfile("changelog.json");
});

// EXPERIMENTAL image proxying feature for where imgur etc. is firewalled
// app.get("/proxyimage", function(req, res){
//   var suppliedAddress = req.query.imageurl;
//   if(suppliedAddress){
//     request({url: suppliedAddress, timeout: 5000}, function (error, response, body) {
//       if (!error && response.statusCode == 200) {
//         res.end(body);
//       }else{
//         res.end("Error loading image address");
//         console.log(error);
//       }
//     });
//   }else{
//     res.end("Error: No address")
//   }
// });

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
        res.end(ers(["Database query error"]));
        return handleError(err);
      }
      if(obj)
      {
        // Existing single link pair
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

          res.end(swapResString(obj._doc, 2, ip));
        });
      }else{
        // New pair
        var newPair = new LinkPair({webLinks:[{
                                               userDescription: postObj.desc,
                                               webURL: postObj.url,
                                               ipAddress: ip,
                                               original: true
                                             }],
                                    createdAt: timestamp
                                  });
        newPair.swapID = sha1(newPair._id + salt);
        newPair.save(function (err, newPairSaved, numberAffected) {
          if (err) {
            res.end(er(["Error saving"]));
            return handleError(err);
          }
          res.end(swapResString(newPairSaved._doc, 1, ip));
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
  v.check(suppliedPairId, "Invalid swap pair id").len(40);

  if(v._errors.length == 0)
  {
    LinkPair.findOne({swapID: suppliedPairId}, function(err, obj){
      if (err)
      {
        res.end(er(["Database query error"]));
        return handleError(err);
      }
      if (obj)
      {
        var polStat = obj.webLinks.length == 1 ? 1 : 2;
        res.end(swapResString(obj._doc, polStat, ip));
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

app.use(app.router);
app.use(function(req, res, next){
  res.status(404);
  res.sendfile("public/templates/not_found.html");
});

var port = process.env.PORT || 3000;
app.listen(port);