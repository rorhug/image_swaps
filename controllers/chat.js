var mongoose = require('mongoose'),
    // LinkPair = mongoose.model('LinkPair'),
    _ = require('underscore'),
    Validator = require('validator').Validator;

// var OnlineUsers = (function () {
//   //swapID: [original]
//   // {1234: [true, false]}
//   var users = {};

//   var join = function (suppliedPairId) {
//     if (!name || userNames[name]) {
//       return false;
//     } else {
//       userNames[name] = true;
//       return true;
//     }
//     LinkPair.findOne({swapID: suppliedPairId}, function(err, obj){
//       if (err)
//       {
//         //Query error
//       }
//       if (obj)
//       {
//         //Found
//         users[obj.swapID] ? users[obj.swapID].push : 
//         return true;
//       }else{
//         //Can't find
//       }
//     });
//   };

//   // serialize claimed names as an array
//   var get = function () {
//     var res = [];
//     for (user in userNames) {
//       res.push(user);
//     }

//     return res;
//   };

//   var free = function (name) {
//     if (userNames[name]) {
//       delete userNames[name];
//     }
//   };

//   return {
//     claim: claim,
//     free: free,
//     get: get,
//     getGuestName: getGuestName
//   };
// }());

module.exports = function(socket) {
  socket.broadcast.to('room').emit('event_name', "hi") //emit to 'room' except this socket
  console.log("Connection");
  socket.on('subscribe', function(data) {
    socket.join(data.room);
    console.log("Joined room");
  });
};