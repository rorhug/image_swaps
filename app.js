'use strict';

console.log("ImageSwaps server... STARTED");

// Modules
var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    _ = require("underscore"),
    fs = require('fs');

var defaultConfig = {
  port: 3000,
  mongoURL: 'mongodb://localhost:27017/image_swaps',
  salt: "omgg2gktnxbai"
}
try {
  var userConfig = require(__dirname + '/config.json');
  console.log('Loading Config');
} catch(e) {
  var userConfig = {};
  console.log('Cannot read/find config.json file, using defaults');
}
global.appConfig = _.defaults(userConfig, defaultConfig);

console.log(appConfig);

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// Socket chat
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 2);

// Setup Mongo
var mongoose = require('mongoose');

mongoose.connect(appConfig.mongoURL);
var db = mongoose.connection;
db.on('error', function(){
  console.log("DATAbaSE ERR0r");
  process.exit();
});
db.once('open', function callback () {
  console.log("Database connected :P");
});

// Bootstrap models
var models_path = __dirname + '/models';
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

// Controllers
var home = require('./controllers/home');
var swaps = require('./controllers/swaps');
var chat = require('./controllers/chat');
chat.setIO(io);
io.sockets.on('connection', chat.chatCtrl);

app.get('/changes.json', home.changes);
app.post('/swap.json', swaps.newSwap);
app.post('/poll.json', swaps.pollSwap);

//Static files

app.configure('development', function(){
  // Serve Statics in development
  app.get('/', home.index);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use('/', express.static(__dirname + '/public'));
  app.use(function(req, res, next){
    res.status(404);
    res.sendfile("public/templates/not_found.html");
  });
});
app.configure('production', function(){
  // Use web server for production
  app.use(express.errorHandler());
});

server.listen(appConfig.port);
console.log("Listening on port " + appConfig.port);
