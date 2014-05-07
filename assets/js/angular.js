angular.module('meetingsApp', [])
.controller('meetingsCtrl', function($scope, $http) {
    $http.get("http://aanapa.dev/wp-admin/admin-ajax.php?action=meetings")
    .success(function(data, status, headers, config) {
        $scope.meetings = data;
    });
});