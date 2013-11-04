var app = angular.module("imageswaps", ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);
  $routeProvider.
    when('/', {
      controller: 'HomeController',
      templateUrl: 'templates/home.html'
    })
    // when('/menu/:restaurantId', {
    //   controller: 'MenuController',
    //   templateUrl: 'views/menu.html'
    // }).
    // when('/todo', {
    //   controller: 'TodoController',
    //   templateUrl: 'todo.html'
    // });
});

app.directive('activeTab', function ($location) {
  return {
    link: function (scope, element, attrs) {
      scope.$on("$routeChangeSuccess", function (event, current, previous) {
        var pathLevel = attrs.tabLevel || 1,
            className = attrs.activeTab;
            pathToCheck = $location.path().split('/')[pathLevel],
            tabLink = element.find("a").attr("href").split('/')[pathLevel];
        if (pathToCheck === tabLink) {
          element.addClass(className);
        }
        else {
          element.removeClass(className);
        }
      });
    }
  };
});

app.controller('HomeController', function($scope, $http){
  $scope.newSwapObject = {};
  $scope.test = function() {
    console.log($scope.newSwapObject);
  }
  $scope.newSwap = function(){

    $http({method: "post", url:"project.json"}).success(function(response) {
      $scope.projects = response;
    });
  }

});