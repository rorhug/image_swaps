'use strict';

Array.prototype.select = function(closure){
  var filtered = [];
  for(var n = 0; n < this.length; n++) {
    if(closure(this[n])){
      filtered.push(this[n]);
    }
  }
  return filtered;
};

var app = angular.module("imageswaps", ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);
  $routeProvider.
    when('/', {
      controller: 'HomeController',
      templateUrl: 'templates/home.html',
      title: "Swap"
    }).
    when('/about', {
      templateUrl: 'templates/about.html',
      title: "About"
    }).
    when('/help', {
      templateUrl: 'templates/help.html',
      title: "Help"
    }).
    otherwise({
      templateUrl: 'templates/not_found.html',
      title: "Not Found"
    });
});


app.run(['$location', '$rootScope', function($location, $rootScope) {
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    $rootScope.title = current.$$route && current.$$route.title;
  });
}]);

app.service('socketService', function ($rootScope, $timeout) {
  return function() {
    this.socket = io.connect();
    this.on = function(eventName, callback) {
      var t = this;
      t.socket.on(eventName, function () {  
        var args = arguments;
        $timeout(function(){
          $rootScope.$apply(function () {
            callback.apply(t.socket, args);
          });
        });
      });
    },
    this.emit = function(eventName, data, callback) {
      var t = this;
      t.socket.emit(eventName, data, function () {
        var args = arguments;
        $timeout(function(){
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(t.socket, args);
            }
          });
        });
      })
    },
    this.disconnect = function() {
      this.socket.disconnect();
    },
    this.reconnect = function() {
      this.socket.socket.connect();
      return this;
    }
  };
});

app.service("buzzSound", function(){
  return function(filename) {
    return new buzz.sound( filename, {
      formats: [ "ogg", "mp3" ]
    });
  }
});

app.factory('swapHTTP', function($http) {
  return {
    swap: function(newSwapObj, cb, erCb) {
      $http({
        method: "POST",
        url:"/swap.json",
        data: {swap: JSON.stringify(newSwapObj)}
      }).success(cb)
      .error(erCb);
    },
    poll: function(swapID, cb, erCb){
      $http({method: "POST", url: "/poll.json?swap_id=" + swapID})
      .success(cb)
      .error(erCb);
    }
  }
});

app.directive('activeTab', function ($location) {
  return {
    link: function (scope, element, attrs) {
      scope.$on("$routeChangeSuccess", function (event, current, previous) {
        var pathLevel = attrs.tabLevel || 1,
            className = attrs.activeTab,
            pathToCheck = $location.path().split("#").pop().split('/')[pathLevel],
            tabLink = element.find("a").attr("href").split("#").pop().split('/')[pathLevel];
        if (pathToCheck === tabLink){
          element.addClass(className);
        }
        else {
          element.removeClass(className);
        }
      });
    }
  };
});

app.directive("chatMessagesScroll", function($timeout){
  return {
    link: function(scope, elem, attrs) {
      var chatElem = angular.element(elem)[0];
      scope.$watch("chatMessages.length", function(newVal, oldVal){
        $timeout(function(){
          chatElem.scrollTop = chatElem.scrollHeight;
        }, 100);
      });
    }
  }
});

app.directive('verifyImg', function () {
  return {
    restrict: "A",
    link: function (scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        var imgSrc = angular.element(this).attr("src");
        // check if not "http://". 
        // It doesn't try and load in the browser but throws a load error :/
        if(imgSrc !== "http://"){
          scope.setValidImage(angular.element(this).attr("src"), false);
        }
      });
      iElement.bind('load', function() {
        scope.setValidImage(angular.element(this).attr("src"), true);
      });
    }
  }
});

app.controller('HomeController', function($scope, $interval, swapHTTP, buzzSound){
  var pollingTimer = null;
  var swapSound;
  $scope.restart = function(newSwapUrl){
    // Hack used to make angular update the 
    $scope.newSwapObject = {url: newSwapUrl || "http://"};
    // 1: looking for new swap, 2: Found swap, 3: chatting
    $scope.swapStatus = false;
    $scope.userImage = "";
    $scope.incomingSwapObject = {};
    $scope.validImgLink = {url: newSwapUrl, valid: newSwapUrl || null};
    $scope.swapID = "";
    $interval.cancel(pollingTimer);

    // [ {user: 0, content: "lol"} ]
    $scope.chatMessages = [];
  }
  $scope.restart();

  $scope.setValidImage = function(link, vld) {
    $scope.validImgLink = { url: link, valid: vld };
    $scope.$apply();
  }

  $scope.validSwap = function() {
    return $scope.newSwapObject.desc &&
           $scope.newSwapForm.$valid &&
           ($scope.validImgLink.valid && ($scope.validImgLink.url == $scope.newSwapObject.url));
  }

  $scope.newSwap = function(){
    swapSound = swapSound || buzzSound("sounds/swap");
    if (!$scope.validSwap()){ return; }
    $scope.swapStatus = 1;

    swapHTTP.swap($scope.newSwapObject, function(r, status, headers, config) {
      if(r.pollStatus == null || isNaN(r.pollStatus)){
        alert("New Swap Server response body without poll status!");
        $scope.restart();
      }
      else{
        $scope.swapID = r.swapID;
        if(r.pollStatus == 2){
          $scope.swapStatus = 2;
          $scope.incomingSwapObject = r.links.select(function(wl){return wl.original})[0];
          $scope.swapStatus = 3;
        }else{
          pollingTimer = $interval(function(){
            swapHTTP.poll(r.swapID, function(rPoll, status, headers, config){
              if(rPoll.pollStatus == null || isNaN(rPoll.pollStatus)){
                alert("Poll Server response body without poll status!");
                $interval.cancel(pollingTimer);
                $scope.restart();
              }else{
                if(rPoll.pollStatus == 2){
                  $scope.swapStatus = 2;
                  $scope.incomingSwapObject = rPoll.links.select(function(wl){return !wl.original})[0];
                  swapSound.play()
                  $interval.cancel(pollingTimer);
                  $scope.swapStatus = 3;
                }
              }
            }, function(){
              console.log("Poll Unreachable/Error response!");
              $scope.restart();
            });
          }, 5000);
        }
      }
    }, function(){
      console.log("New Swap Unreachable/Error response!");
      $scope.restart();
    });
  }
});

app.controller('ChatController', function($scope, $timeout, socketService, buzzSound){
  var chatSound;
  var socket; // Initialize socket var
  var formTimer;
  $scope.cssUser = function(u){
    if(u == $scope.myUser){return "me"}
    else if(u == 2){return "op"}
    else{return "them"}
  }
  // chatmessage: client -> server
  // shatmessage: server -> client :)
  $scope.startChat = function() {
    $scope.chatMessages = [];
    $scope.message = {}; // Chat form model
    $scope.formDisabled = true; // Delayed version
    $scope.myUser = Number(!$scope.incomingSwapObject.original);
    chatSound = chatSound || buzzSound("sounds/chat");

    if(socket)
    {
      socket.reconnect();
    } else {
      socket = new socketService();
      socket.on("subNow", function(msg){
        socket.emit("subscribe", {room: $scope.swapID});
      });
      socket.on("shatmessage", function(msgObj){
        $scope.chatMessages.push(msgObj);
        // re-enable form
        if(msgObj.user === $scope.myUser || msgObj.action === "other_connect"){

          $scope.formDisabled = true;
          $timeout.cancel(formTimer);
          formTimer = $timeout(function() {
            $scope.formDisabled = false;
          }, 400);
        };
        if((msgObj.user !== $scope.myUser) && (msgObj.user !== 2)) { chatSound.play(); }
        if(msgObj.action === "other_left"){$scope.endChat()};
      });
      socket.on("disconnect", function(){
        $scope.chatMessages.push({user: 2, content: "(disconnected)"});
      });
    }
  }
  $scope.endChat = function(){
    socket.disconnect();
  }
  $scope.$watch('swapStatus', function(newValue, oldValue) {
    if(newValue == 3) {
      $scope.startChat();
    }else{
      if(socket){$scope.endChat()};
    };
  });
  $scope.sendMessage = function(m) {
    if($scope.swapStatus != 3 || $scope.chatForm.$invalid) return;
    // chatObj {content: string, user: int}
    socket.emit("chatmessage", {content: $scope.message.content, user: $scope.myUser});
    $scope.message.content = "";
  }
});

app.controller('ChangeLogController', function($scope, $http){
  var versionsLoaded = [];
  $http({
    method: "GET",
    url: "/changes.json"
  }).success(function(response, status, headers) {
    versionsLoaded = response.log;
    $scope.versions = versionsLoaded.concat().splice(0, 3);
    $scope.ideas = response.coming_soon;
  }).error(function(){
    $scope.loadError = "Error Loading Changelog";
  });
  $scope.showAll = function(){
    $scope.versions = versionsLoaded;
  }
});