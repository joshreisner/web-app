angular.module('meetingsApp', ['LocalStorageModule'])
.filter('escape', function() {
	return window.escape;
})
.controller('meetingsCtrl', function($scope, $http, $location, $anchorScroll, localStorageService) {

	//set time variables
    var now = new Date();
    var hours = now.getHours() + "";
    var minutes = now.getMinutes() + "";
    if (hours.length == 1) hours = "0" + hours;
    if (minutes.length == 1) minutes = "0" + minutes;
    time = hours + ":" + minutes;
	$scope.selected_day = now.getDay();
    $scope.selected_region = "";

    //populate days dropdown
    $scope.days = [
    	{ id: 0, value: "Sunday" }, 
    	{ id: 1, value: "Monday" },
    	{ id: 2, value: "Tuesday" }, 
    	{ id: 3, value: "Wednesday" }, 
    	{ id: 4, value: "Thursday" },
    	{ id: 5, value: "Friday" }, 
    	{ id: 6, value: "Saturday" }
    ];

	//get regions list
	$scope.regions = localStorageService.get('regions');
    $http.get("http://aasanjose.org/wp-admin/admin-ajax.php?action=regions")
    .success(function(data, status, headers, config) {
        $scope.regions = data;
		localStorageService.add('regions', data);
    });

	//get meeting list
	$scope.meetings = localStorageService.get('meetings');
    $http.get("http://aasanjose.org/wp-admin/admin-ajax.php?action=meetings")
    .success(function(data, status, headers, config) {
        $scope.meetings = data;
		localStorageService.add('meetings', data);

        //scroll to
        var scrollTo = false;
		angular.forEach(data, function(value) {
			if (!scrollTo && ($scope.selected_day == value.day) && value.time >= time) {
				//console.log(value.time + ' > ' + time + ' so scrolling to ' + value.name);
				scrollTo = value.id;
				$location.hash(value.id);
			    $anchorScroll();
			}
		}, scrollTo, time);
    });

    $scope.format_time = function(time) {
    	var time_parts = time.split(':');
    	var hours = time_parts[0];
    	var minutes = time_parts[1];
    	if ((hours == 12) && (minutes == 0)) return 'Noon';
    	if ((hours == 23) && (minutes == 59)) return 'Mid';
    	if (hours < 12) return (hours - 0) + ':' + minutes + 'a';
    	if (hours == 12) return '12:' + minutes + 'p';
    	return (hours - 12) + ':' + minutes + 'p';
    }

    $scope.format_types = function(types) {
    	for (var i = 0; i < types.length; i++) {
    		if (types[i] == 'M') return "Men";
    		if (types[i] == 'W') return "Women";
    	}
    }

});