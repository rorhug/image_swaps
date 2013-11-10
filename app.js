'use strict';

console.log("ImageSwaps server... STARTED");

// Modules
var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

var fs = require("fs");

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

var toobusy = require('toobusy');
app.use(function(req, res, next) {
  if (toobusy()) {
    res.send(503, "I'm busy right now, sorry.");
  } else {
    next();
  }
});

// Various functions and variables
process.on('SIGINT', function() {
  server.close();
  // calling .shutdown allows the process to exit normally
  toobusy.shutdown();
  process.exit();
});

// Socket chat
var chat = require('./controllers/chat.js');
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.sockets.on('connection', chat);
io.set('log level', 2);

// Setup Mongo
var mongoose = require('mongoose');

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
var models_path = __dirname + '/models';
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

var swaps = require('./controllers/swaps');

// app.get('/', home.index);
// app.get('/changes.json', home.changes);
app.post('/swap.json', swaps.newSwap);
app.post('/poll.json', swaps.pollSwap);

//Static files
app.use('/', express.static(__dirname + '/public'));

app.use(function(req, res, next){
  res.status(404);
  res.sendfile("public/templates/not_found.html");
});

var port = process.env.PORT || 3000;
server.listen(port);
