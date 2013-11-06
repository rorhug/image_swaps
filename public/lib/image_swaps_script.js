Array.prototype.select = function(closure){
  var filtered = [];
  for(var n = 0; n < this.length; n++) {
    if(closure(this[n])){
      filtered.push(this[n]);
    }
  }
  return filtered;
};

var app = angular.module("imageswaps", ['ngRoute','angulartics','angulartics.google.analytics']);

app.config(function($routeProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);
  $routeProvider.
    when('/', {
      controller: 'HomeController',
      templateUrl: 'templates/home.html'
    }).
    when('/about', {
      templateUrl: 'templates/about.html'
    }).
    when('/help', {
      templateUrl: 'templates/help.html'
    });
});

app.directive('activeTab', function ($location) {
  return {
    link: function (scope, element, attrs) {
      scope.$on("$routeChangeSuccess", function (event, current, previous) {
        var pathLevel = attrs.tabLevel || 1,
            className = attrs.activeTab;
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

app.controller('HomeController', function($scope, $http, $timeout){
  var pollingTimer = null;
  $scope.restart = function(newSwapUrl){
    $scope.newSwapObject = {url: newSwapUrl};
    $scope.swapStatus = false;
    $scope.userImage = "";
    $scope.incomingSwapObject = {};
    clearInterval(pollingTimer);
  }
  $scope.restart();
  $scope.newSwap = function(){
    if (!$scope.newSwapObject.desc || !$scope.newSwapForm.$valid){
      return;
    }
    $scope.swapStatus = 1;

    $http({
      method: "POST",
      url:"/swap.json",
      data: {swap: JSON.stringify($scope.newSwapObject)}
    }).success(function(r, status, headers, config) {
      if(r.pollStatus == null || isNaN(r.pollStatus)){
        alert("New Swap Server response body without poll status!");
        $scope.restart();
      }
      else{
        if(r.pollStatus == 2){
          $scope.swapStatus = 2;
          $scope.incomingSwapObject = r.links.select(function(wl){return wl.original})[0];
        }else{
          pollingTimer = setInterval(function(){
            $http({method: "POST", url: "/poll.json?swap_id=" + r.swapID}).success(function(rPoll, status, headers, config){
              if(rPoll.pollStatus == null || isNaN(rPoll.pollStatus)){
                alert("Poll Server response body without poll status!");
                $scope.restart();
              }else{
                if(rPoll.pollStatus == 2){
                  $scope.swapStatus = 2;
                  $scope.incomingSwapObject = rPoll.links.select(function(wl){return !wl.original})[0];
                  clearInterval(pollingTimer);
                }
              }
            }).error(function(){
              console.log("Poll Unreachable/Error response!");
              $scope.restart();
            });
          }, 5000);
        }
      }
    }).error(function(){
      alert("New Swap Unreachable/Error response!");
    });
  }
});
