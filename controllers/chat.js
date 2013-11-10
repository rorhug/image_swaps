'use strict';

var mongoose = require('mongoose'),
    LinkPair = mongoose.model('LinkPair'),
    _ = require('underscore'),
    Validator = require('validator').Validator;

exports.chatCtrl = function(socket) {
  console.log("Connection");
  socket.on('subscribe', function(requestedRoom) {
  	LinkPair.findOne({swapID: requestedRoom}, function(err, obj){
  		var roomName = obj.swapID;
      if (err)
      {
      	socket.emit("status", "database_error");
      	socket.broadcast.to(roomName).emit('status', "over");
        return handleError(err);
      }
      if (obj)
      {
		    socket.join(roomName);
		    console.log("Joined room" + roomName);
      	// socket.broadcast.to(data.room).emit('chatmessage', { client: , message: data.message, room: data.room });
      }else{
      	socket.emit("status", "swapID_error");
      	socket.broadcast.to(roomName).emit('status', "over");
      }
    });
  });
  socket.on('disconnect', function(){
  	socket.broadcast.to(roomName).emit('status', "over");
    disconnect(socket);
  });
  socket.on('chatmessage', function(msgObj){
  	
  	console.log(msgObj.content);
  });
};