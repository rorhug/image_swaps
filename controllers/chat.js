'use strict';

var mongoose = require('mongoose'),
    LinkPair = mongoose.model('LinkPair'),
    _ = require('underscore'),
    Validator = require('validator').Validator;

Validator.prototype.error = function (msg) {
  this._errors.push(msg);
  return this;
}

Validator.prototype.getErrors = function () {
  return;
}

var io;

exports.setIO = function(i) {
  io = i;
}

exports.chatCtrl = function(socket) {
  // chatmessage: client -> server
  // shatmessage: server -> client :)
  var dbObj, roomName;

  socket.emit("subNow", "1");
  var subTimeout = setTimeout(function(){
    socket.disconnect();
  }, 5000);

  socket.on('subscribe', function(subObj) {
    clearTimeout(subTimeout);
  	LinkPair.findOne({swapID: subObj.room}, function(err, mongooseObj){
      dbObj = mongooseObj;
      if (err)
      {
        io.sockets.in(roomName).emit('shatmessage', {user: 2, content: "Database error!", action: "error"});
        socket.disconnect();
        return handleError(err);
      }
      if (dbObj)
      {
        roomName = dbObj.swapID;
		    socket.join(roomName);
		    console.log("Joined room-" + roomName);

        var numberOfClients = io.sockets.clients(roomName).length;
        if(numberOfClients == 1) {
          socket.emit('shatmessage', {user: 2, content: "Connected. Waiting for other user...", action: "join_room"});
          var bothJoinedTimeout = setTimeout(function(){
            numberOfClients = io.sockets.clients(roomName).length;
            if(numberOfClients == 1){
              socket.emit('shatmessage', {user: 2, content: "The other person left. :(", action: "other_left"});
              socket.disconnect();
            }
          }, 9500);
        } else if(numberOfClients == 2) {
          clearTimeout(bothJoinedTimeout);
          io.sockets.in(roomName).emit('shatmessage', {user: 2, content: "Start chatting...", action: "other_connect"});
        } else {
          io.sockets.in(roomName).emit('shatmessage', {user: 2, content: "There is a odd number of user's in this room...", action: "other_connect"});
          socket.disconnect();
        }
      }else{
        socket.emit('shatmessage', {user: 2, content: "swapID error", action: "disconnect"});
        socket.disconnect();
      }
    });
  });

  socket.on('disconnect', function(){
  	socket.broadcast.to(roomName).emit('shatmessage', {user: 2, content: "The other person left. :(", action: "other_left"});
    console.log("Disconnect-" + roomName || "(never in room)");
  });

  socket.on('chatmessage', function(msgObj){
    // TODO validation
    // v.check(msgObj.content, "Description must be between 1 and 250 characters").len(1, 250);
  	dbObj.chatMessage( {content: msgObj.content, original: Boolean(msgObj.user)}, function(err, savedObj){
      io.sockets.in(roomName).emit('shatmessage', msgObj);
    });
  });
};