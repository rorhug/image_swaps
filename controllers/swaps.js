'use strict';

var mongoose = require('mongoose'),
  	LinkPair = mongoose.model('LinkPair'),
  	_ = require('underscore'),
		Validator = require('validator').Validator;

function ers(error_list)
{
  return {errors: error_list};
}

function getIP(req){
  return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
}

Validator.prototype.error = function (msg) {
  this._errors.push(msg);
  return this;
}

Validator.prototype.getErrors = function () {
  return;
}

exports.newSwap = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var v = new Validator();

  // Post object is a json string in the form of:
  // {"desc": "cool cat", "url": "http://imgur.com/catpic"}
  try
  {
    var postObj = JSON.parse(req.body.swap);
  }
  catch(e)
  {
    // Exit when the information is not parsable
    return res.json(400, ers(["bad data"]));
  }

  v.check(postObj.desc, "Description must be between 1 and 250 characters").len(1, 250);
  v.check(postObj.url).isUrl();

  if (v._errors.length > 0) {
    return res.json(400, ers(v._errors));
  }

  var swapObj = new LinkPair({
  	webLinks: [{
	    userDescription: postObj.desc,
	    webURL: postObj.url,
	    ipAddress: getIP(req)
  	}]
  });

  swapObj.joinPair(function(err, obj){
  	if (err) {
      res.json(500, er(["Error saving"]));
      return handleError(err);
    }
    return res.json(200, obj.resObj());
  });
};

exports.pollSwap = function(req, res){
  res.setHeader('Content-Type', 'text/json');
	//get the swap id url param
  var suppliedPairId = req.query.swap_id;
  var v = new Validator();
  // Check if it is a 40 character sha1 hex
  v.check(suppliedPairId, "Invalid swap pair id").len(40);

  if(v._errors.length == 0)
  {
    LinkPair.findOne({swapID: suppliedPairId}, function(err, obj){
      if (err)
      {
        res.json(500, er(["Database query error"]));
        return handleError(err);
      }
      if (obj)
      {
        res.json(200, obj.resObj());
      }else{
        res.json(400, {pollStatus: 0, errors: ["Unable to find swap pair"]});
      }
    });
  }else{
    // Send validation errors
    res.json(400, ers(v._errors));
  }
}

