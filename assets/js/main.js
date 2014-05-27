angular.module('meetingsApp', [])
.controller('meetingsCtrl', function($scope, $http, $location, $anchorScroll) {

	//set some variables
    var now = new Date();
    var hours = now.getHours() + "";
    var minutes = now.getMinutes() + "";
    if (hours.length == 1) hours = "0" + hours;
    if (minutes.length == 1) minutes = "0" + minutes;
    time = hours + ":" + minutes;
    //console.log(time);
	$scope.selected_day = now.getDay();
    $scope.selected_region = "";

	//get meeting list
    $http.get("//aasanjose.dev/wp-admin/admin-ajax.php?action=meetings")
    .success(function(data, status, headers, config) {
        $scope.meetings = data;

        //scroll to
        var scrollTo = false;
		angular.forEach(data, function(value) {
			if (!scrollTo && value.time >= time) {
				//console.log(value.time + ' > ' + time + ' so scrolling to ' + value.name);
				scrollTo = value.id;
				$location.hash(value.id);
			    $anchorScroll();
			}
		}, scrollTo, time);
    });

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
    $http.get("//aasanjose.dev/wp-admin/admin-ajax.php?action=regions")
    .success(function(data, status, headers, config) {
        $scope.regions = data;
    });

    $scope.format_time = function(time) {
    	var time_parts = time.split(':');
    	var hours = time_parts[0];
    	var minutes = time_parts[1];
    	if ((hours == '12') && (minutes == '00')) return 'Noon';
    	if ((hours == 23) && (minutes == 59)) return 'Mid';
    	if (hours < 12) return (hours - 0) + ':' + minutes + 'a';
    	return (hours - 12) + ':' + minutes + 'p';
    }

});