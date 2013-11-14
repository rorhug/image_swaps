'use strict';

 // ----------------------------------------------------------------------------
 // Buzz, a Javascript HTML5 Audio library
 // v1.1.0 - released 2013-08-15 13:18
 // Licensed under the MIT license.
 // http://buzz.jaysalvat.com/
 // ----------------------------------------------------------------------------
 // Copyright (C) 2010-2013 Jay Salvat
 // http://jaysalvat.com/
 // ----------------------------------------------------------------------------
(function(t,n,e){"undefined"!=typeof module&&module.exports?module.exports=e():"function"==typeof n.define&&n.define.amd?define(t,[],e):n[t]=e()})("buzz",this,function(){var t={defaults:{autoplay:!1,duration:5e3,formats:[],loop:!1,placeholder:"--",preload:"metadata",volume:80,document:document},types:{mp3:"audio/mpeg",ogg:"audio/ogg",wav:"audio/wav",aac:"audio/aac",m4a:"audio/x-m4a"},sounds:[],el:document.createElement("audio"),sound:function(n,e){function i(t){for(var n=[],e=t.length-1,i=0;e>=i;i++)n.push({start:t.start(i),end:t.end(i)});return n}function u(t){return t.split(".").pop()}function s(n,e){var i=r.createElement("source");i.src=e,t.types[u(e)]&&(i.type=t.types[u(e)]),n.appendChild(i)}e=e||{};var r=e.document||t.defaults.document,o=0,a=[],h={},l=t.isSupported();if(this.load=function(){return l?(this.sound.load(),this):this},this.play=function(){return l?(this.sound.play(),this):this},this.togglePlay=function(){return l?(this.sound.paused?this.sound.play():this.sound.pause(),this):this},this.pause=function(){return l?(this.sound.pause(),this):this},this.isPaused=function(){return l?this.sound.paused:null},this.stop=function(){return l?(this.setTime(0),this.sound.pause(),this):this},this.isEnded=function(){return l?this.sound.ended:null},this.loop=function(){return l?(this.sound.loop="loop",this.bind("ended.buzzloop",function(){this.currentTime=0,this.play()}),this):this},this.unloop=function(){return l?(this.sound.removeAttribute("loop"),this.unbind("ended.buzzloop"),this):this},this.mute=function(){return l?(this.sound.muted=!0,this):this},this.unmute=function(){return l?(this.sound.muted=!1,this):this},this.toggleMute=function(){return l?(this.sound.muted=!this.sound.muted,this):this},this.isMuted=function(){return l?this.sound.muted:null},this.setVolume=function(t){return l?(0>t&&(t=0),t>100&&(t=100),this.volume=t,this.sound.volume=t/100,this):this},this.getVolume=function(){return l?this.volume:this},this.increaseVolume=function(t){return this.setVolume(this.volume+(t||1))},this.decreaseVolume=function(t){return this.setVolume(this.volume-(t||1))},this.setTime=function(t){if(!l)return this;var n=!0;return this.whenReady(function(){n===!0&&(n=!1,this.sound.currentTime=t)}),this},this.getTime=function(){if(!l)return null;var n=Math.round(100*this.sound.currentTime)/100;return isNaN(n)?t.defaults.placeholder:n},this.setPercent=function(n){return l?this.setTime(t.fromPercent(n,this.sound.duration)):this},this.getPercent=function(){if(!l)return null;var n=Math.round(t.toPercent(this.sound.currentTime,this.sound.duration));return isNaN(n)?t.defaults.placeholder:n},this.setSpeed=function(t){return l?(this.sound.playbackRate=t,this):this},this.getSpeed=function(){return l?this.sound.playbackRate:null},this.getDuration=function(){if(!l)return null;var n=Math.round(100*this.sound.duration)/100;return isNaN(n)?t.defaults.placeholder:n},this.getPlayed=function(){return l?i(this.sound.played):null},this.getBuffered=function(){return l?i(this.sound.buffered):null},this.getSeekable=function(){return l?i(this.sound.seekable):null},this.getErrorCode=function(){return l&&this.sound.error?this.sound.error.code:0},this.getErrorMessage=function(){if(!l)return null;switch(this.getErrorCode()){case 1:return"MEDIA_ERR_ABORTED";case 2:return"MEDIA_ERR_NETWORK";case 3:return"MEDIA_ERR_DECODE";case 4:return"MEDIA_ERR_SRC_NOT_SUPPORTED";default:return null}},this.getStateCode=function(){return l?this.sound.readyState:null},this.getStateMessage=function(){if(!l)return null;switch(this.getStateCode()){case 0:return"HAVE_NOTHING";case 1:return"HAVE_METADATA";case 2:return"HAVE_CURRENT_DATA";case 3:return"HAVE_FUTURE_DATA";case 4:return"HAVE_ENOUGH_DATA";default:return null}},this.getNetworkStateCode=function(){return l?this.sound.networkState:null},this.getNetworkStateMessage=function(){if(!l)return null;switch(this.getNetworkStateCode()){case 0:return"NETWORK_EMPTY";case 1:return"NETWORK_IDLE";case 2:return"NETWORK_LOADING";case 3:return"NETWORK_NO_SOURCE";default:return null}},this.set=function(t,n){return l?(this.sound[t]=n,this):this},this.get=function(t){return l?t?this.sound[t]:this.sound:null},this.bind=function(t,n){if(!l)return this;t=t.split(" ");for(var e=this,i=function(t){n.call(e,t)},u=0;t.length>u;u++){var s=t[u],r=s;s=r.split(".")[0],a.push({idx:r,func:i}),this.sound.addEventListener(s,i,!0)}return this},this.unbind=function(t){if(!l)return this;t=t.split(" ");for(var n=0;t.length>n;n++)for(var e=t[n],i=e.split(".")[0],u=0;a.length>u;u++){var s=a[u].idx.split(".");(a[u].idx==e||s[1]&&s[1]==e.replace(".",""))&&(this.sound.removeEventListener(i,a[u].func,!0),a.splice(u,1))}return this},this.bindOnce=function(t,n){if(!l)return this;var e=this;return h[o++]=!1,this.bind(t+"."+o,function(){h[o]||(h[o]=!0,n.call(e)),e.unbind(t+"."+o)}),this},this.trigger=function(t){if(!l)return this;t=t.split(" ");for(var n=0;t.length>n;n++)for(var e=t[n],i=0;a.length>i;i++){var u=a[i].idx.split(".");if(a[i].idx==e||u[0]&&u[0]==e.replace(".","")){var s=r.createEvent("HTMLEvents");s.initEvent(u[0],!1,!0),this.sound.dispatchEvent(s)}}return this},this.fadeTo=function(n,e,i){function u(){setTimeout(function(){n>s&&n>o.volume?(o.setVolume(o.volume+=1),u()):s>n&&o.volume>n?(o.setVolume(o.volume-=1),u()):i instanceof Function&&i.apply(o)},r)}if(!l)return this;e instanceof Function?(i=e,e=t.defaults.duration):e=e||t.defaults.duration;var s=this.volume,r=e/Math.abs(s-n),o=this;return this.play(),this.whenReady(function(){u()}),this},this.fadeIn=function(t,n){return l?this.setVolume(0).fadeTo(100,t,n):this},this.fadeOut=function(t,n){return l?this.fadeTo(0,t,n):this},this.fadeWith=function(t,n){return l?(this.fadeOut(n,function(){this.stop()}),t.play().fadeIn(n),this):this},this.whenReady=function(t){if(!l)return null;var n=this;0===this.sound.readyState?this.bind("canplay.buzzwhenready",function(){t.call(n)}):t.call(n)},l&&n){for(var d in t.defaults)t.defaults.hasOwnProperty(d)&&(e[d]=e[d]||t.defaults[d]);if(this.sound=r.createElement("audio"),n instanceof Array)for(var c in n)n.hasOwnProperty(c)&&s(this.sound,n[c]);else if(e.formats.length)for(var f in e.formats)e.formats.hasOwnProperty(f)&&s(this.sound,n+"."+e.formats[f]);else s(this.sound,n);e.loop&&this.loop(),e.autoplay&&(this.sound.autoplay="autoplay"),this.sound.preload=e.preload===!0?"auto":e.preload===!1?"none":e.preload,this.setVolume(e.volume),t.sounds.push(this)}},group:function(t){function n(){for(var n=e(null,arguments),i=n.shift(),u=0;t.length>u;u++)t[u][i].apply(t[u],n)}function e(t,n){return t instanceof Array?t:Array.prototype.slice.call(n)}t=e(t,arguments),this.getSounds=function(){return t},this.add=function(n){n=e(n,arguments);for(var i=0;n.length>i;i++)t.push(n[i])},this.remove=function(n){n=e(n,arguments);for(var i=0;n.length>i;i++)for(var u=0;t.length>u;u++)if(t[u]==n[i]){t.splice(u,1);break}},this.load=function(){return n("load"),this},this.play=function(){return n("play"),this},this.togglePlay=function(){return n("togglePlay"),this},this.pause=function(t){return n("pause",t),this},this.stop=function(){return n("stop"),this},this.mute=function(){return n("mute"),this},this.unmute=function(){return n("unmute"),this},this.toggleMute=function(){return n("toggleMute"),this},this.setVolume=function(t){return n("setVolume",t),this},this.increaseVolume=function(t){return n("increaseVolume",t),this},this.decreaseVolume=function(t){return n("decreaseVolume",t),this},this.loop=function(){return n("loop"),this},this.unloop=function(){return n("unloop"),this},this.setTime=function(t){return n("setTime",t),this},this.set=function(t,e){return n("set",t,e),this},this.bind=function(t,e){return n("bind",t,e),this},this.unbind=function(t){return n("unbind",t),this},this.bindOnce=function(t,e){return n("bindOnce",t,e),this},this.trigger=function(t){return n("trigger",t),this},this.fade=function(t,e,i,u){return n("fade",t,e,i,u),this},this.fadeIn=function(t,e){return n("fadeIn",t,e),this},this.fadeOut=function(t,e){return n("fadeOut",t,e),this}},all:function(){return new t.group(t.sounds)},isSupported:function(){return!!t.el.canPlayType},isOGGSupported:function(){return!!t.el.canPlayType&&t.el.canPlayType('audio/ogg; codecs="vorbis"')},isWAVSupported:function(){return!!t.el.canPlayType&&t.el.canPlayType('audio/wav; codecs="1"')},isMP3Supported:function(){return!!t.el.canPlayType&&t.el.canPlayType("audio/mpeg;")},isAACSupported:function(){return!!t.el.canPlayType&&(t.el.canPlayType("audio/x-m4a;")||t.el.canPlayType("audio/aac;"))},toTimer:function(t,n){var e,i,u;return e=Math.floor(t/3600),e=isNaN(e)?"--":e>=10?e:"0"+e,i=n?Math.floor(t/60%60):Math.floor(t/60),i=isNaN(i)?"--":i>=10?i:"0"+i,u=Math.floor(t%60),u=isNaN(u)?"--":u>=10?u:"0"+u,n?e+":"+i+":"+u:i+":"+u},fromTimer:function(t){var n=(""+t).split(":");return n&&3==n.length&&(t=3600*parseInt(n[0],10)+60*parseInt(n[1],10)+parseInt(n[2],10)),n&&2==n.length&&(t=60*parseInt(n[0],10)+parseInt(n[1],10)),t},toPercent:function(t,n,e){var i=Math.pow(10,e||0);return Math.round(100*t/n*i)/i},fromPercent:function(t,n,e){var i=Math.pow(10,e||0);return Math.round(n/100*t*i)/i}};return t});

/**
 * @license Angulartics v0.8.5
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
!function(a){"use strict";var b=window.angulartics||(window.angulartics={});b.waitForVendorApi=function(a,c,d){window.hasOwnProperty(a)?d(window[a]):setTimeout(function(){b.waitForVendorApi(a,c,d)},c)},a.module("angulartics",[]).provider("$analytics",function(){var b={pageTracking:{autoTrackFirstPage:false,autoTrackVirtualPages:!0,basePath:"",bufferFlushDelay:1e3},eventTracking:{bufferFlushDelay:1e3}},c={pageviews:[],events:[]},d=function(a){c.pageviews.push(a)},e=function(a,b){c.events.push({name:a,properties:b})},f={settings:b,pageTrack:d,eventTrack:e},g=function(d){f.pageTrack=d,a.forEach(c.pageviews,function(a,c){setTimeout(function(){f.pageTrack(a)},c*b.pageTracking.bufferFlushDelay)})},h=function(d){f.eventTrack=d,a.forEach(c.events,function(a,c){setTimeout(function(){f.eventTrack(a.name,a.properties)},c*b.eventTracking.bufferFlushDelay)})};return{$get:function(){return f},settings:b,virtualPageviews:function(a){this.settings.pageTracking.autoTrackVirtualPages=a},firstPageview:function(a){this.settings.pageTracking.autoTrackFirstPage=a},withBase:function(b){this.settings.pageTracking.basePath=b?a.element("base").attr("href"):""},registerPageTrack:g,registerEventTrack:h}}).run(["$rootScope","$location","$analytics",function(a,b,c){c.settings.pageTracking.autoTrackFirstPage&&c.pageTrack(b.absUrl()),c.settings.pageTracking.autoTrackVirtualPages&&a.$on("$routeChangeSuccess",function(a,d){if(!d||!(d.$$route||d).redirectTo){var e=c.settings.pageTracking.basePath+b.url();c.pageTrack(e)}})}]).directive("analyticsOn",["$analytics",function(b){function c(a){return["a:","button:","button:button","button:submit","input:button","input:submit"].indexOf(a.tagName.toLowerCase()+":"+(a.type||""))>=0}function d(a){return c(a)?"click":"click"}function e(a){return c(a)?a.innerText||a.value:a.id||a.name||a.tagName}function f(a){return"analytics"===a.substr(0,9)&&-1===["on","event"].indexOf(a.substr(10))}return{restrict:"A",scope:!1,link:function(c,g,h){var i=h.analyticsOn||d(g[0]),j=h.analyticsEvent||e(g[0]),k={};a.forEach(h.$attr,function(a,b){f(a)&&(k[b.slice(9).toLowerCase()]=h[b])}),a.element(g[0]).bind(i,function(){b.eventTrack(j,k)})}}}])}(angular);

/**
 * @license Angulartics v0.8.5
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Universal Analytics update contributed by http://github.com/willmcclellan
 * License: MIT
 */
!function(a){"use strict";a.module("angulartics.google.analytics",["angulartics"]).config(["$analyticsProvider",function(a){a.registerPageTrack(function(a){window._gaq&&_gaq.push(["_trackPageview",a]),window.ga&&ga("send","pageview",a)}),a.registerEventTrack(function(a,b){window._gaq&&_gaq.push(["_trackEvent",b.category,a,b.label,b.value]),window.ga&&ga("send","event",b.category,a,b.label,b.value)})}])}(angular);

Array.prototype.select = function(closure){
  var filtered = [];
  for(var n = 0; n < this.length; n++) {
    if(closure(this[n])){
      filtered.push(this[n]);
    }
  }
  return filtered;
};

var app = angular.module("imageswaps", ['ngRoute', 'angulartics.google.analytics']);

app.config(function($routeProvider, $locationProvider, $analyticsProvider) {
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
    when('/live', {
      templateUrl: 'templates/live.html',
      title: "Live"
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
          }, 800);
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