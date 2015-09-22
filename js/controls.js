var app = angular.module('myApp', []);

app.controller('customersCtrl', function($scope, $http) {
  $http.get("../cgi-bin/customers.py")
  //$http.get("http://www.w3schools.com/website/Customers_mysq.php")
  .success(function (response) {$scope.names = response;});
});

app.controller('testCases', function($scope, $http) {
  $http.get("../cgi-bin/test_list.py")
  .success(function (response) {$scope.cases = response;});
});


