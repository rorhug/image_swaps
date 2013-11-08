Array.prototype.select = function(closure){
  var filtered = [];
  for(var n = 0; n < this.length; n++) {
    if(closure(this[n])){
      filtered.push(this[n]);
    }
  }
  return filtered;
};

var app = angular.module("imageswaps", ['ngRoute','angulartics']);

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
    $rootScope.title = current.$$route.title;
  });
}]);

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

app.directive('verifyImg', function () {
  return {
    restrict: "A",
    link: function (scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        scope.setValidImage(angular.element(this).attr("src"), false);
      });
      iElement.bind('load', function() {
        scope.setValidImage(angular.element(this).attr("src"), true);
      });
    }
  }
});

app.controller('HomeController', function($scope, $http, $timeout){
  var pollingTimer = null;
  $scope.restart = function(newSwapUrl){
    // Hack used to make angular update the 
    $scope.newSwapObject = {url: newSwapUrl || " "};
    $scope.swapStatus = false;
    $scope.userImage = "";
    $scope.incomingSwapObject = {};
    $scope.validImgLink = {url: newSwapUrl, valid: newSwapUrl || null};
    clearInterval(pollingTimer);
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
    if (!$scope.validSwap()){
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
                clearInterval(pollingTimer);
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

app.controller('ChangeLogController', function($scope, $http){
  $http({
    method: "GET",
    url: "/changes.json"
  }).success(function(response, status, headers) {
    $scope.versions = response.log;
    $scope.ideas = response.coming_soon;
  }).error(function(){
    $scope.loadError = "Error Loading Changelog";
  });
});