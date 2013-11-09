var Validator = require('validator').Validator;
var sanitize = require('validator').sanitize;
Validator.prototype.error = function (msg) {
  this._errors.push(msg);
  return this;
}

Validator.prototype.getErrors = function () {
  return;
}

var crypto = require('crypto');

var linkPairSchema = mongoose.Schema({
  createdAt: Date,
  swapID: String,
  webLinks: [{userDescription: String, webURL: String, ipAddress: String, original: Boolean}]
});

linkPairSchema.statics = {
};

linkPairSchema.methods = {
	findSingle: function(cb){
		this.findOne({webLinks: {$size: 1}}, cb);
	},

	joinPair: function(webLinks, cb){
	  var timestamp = new Date;
	  var newSwap = this;

		this.findSingle(function(err, obj){
			if(err) return handleError(err);
			if(obj){
				this.webLinks[0].original = true;
				this.webLinks[0].
				obj.webLinks.push(this.webLinks[0]);
        obj.save(cb);
			}else{
				
			}
		});
	},

	resString: function()
	{
	  var links = _.map(this.webLinks, function(liO){
	  	return {
	  		desc:     liO.userDescription,
        url:      liO.webURL,
        original: liO.original
      }
    });
	  return JSON.stringify({
	    swapID: this.swapID,
	    pollStatus: this.pollStatus,
	    links: links
	  });
	},

	setSwapID: function()
	{
	  var shasum = crypto.createHash('sha1');
	  shasum.update(this._id + salt);
	  this.swapID = shasum.digest('hex');
	  return this;
	}
}

linkPairSchema.virtual("pollStatus").get(function(){
	if(this.webLinks == null || this.webLinks == undefined || this.webLinks == []) return 0;
	return(this.webLinks.length);
});

mongoose.model('LinkPair', linkPairSchema);