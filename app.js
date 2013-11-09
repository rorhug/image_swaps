'use strict';

console.log("ImageSwaps server... STARTED");

var express = require('express'),
    app = express();

app.use(express.bodyParser());
app.use(express.logger());

var salt = process.env.SWAP_ID_SALT || "omgg2gktnxbai";
console.log("Salt is: " + salt);

var toobusy = require('toobusy');
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

// Setup Mongo
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/image_swaps');
var db = mongoose.connection;
db.on('error', function(){
  console.log("DATAbaSE ERR0r");
  process.kill();
});
db.once('open', function callback () {
  console.log("Database connected :P")
});

// Bootstrap models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

var swaps = require('./controllers/swaps');

app.get('/', home.index);
app.get('/changes.json', home.changes);
app.get('/swap.json', swaps.newSwap);
app.post('/poll.json', swaps.pollSwap);

app.use(app.router);
app.use(function(req, res, next){
  res.status(404);
  res.sendfile("public/templates/not_found.html");
});

var port = process.env.PORT || 3000;
app.listen(port);

// expose app
exports = module.exports = app;