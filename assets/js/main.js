//= include ../../bower_components/add-to-homescreen/src/addtohomescreen.js
//= include ../../bower_components/angular/angular.min.js
//= include ../../bower_components/angular-local-storage/angular-local-storage.min.js
//= include ../../bower_components/jquery/dist/jquery.js
//= include ../../bower_components/bootstrap-sass/dist/js/bootstrap.js

angular
	.module('meetingsApp', ['LocalStorageModule'])
	.filter('escape', function() {
		return window.escape;
	})
	/*.config(function($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider
			.when('/page1', { template: 'page1.html', controller: 'Page1Ctrl' })
			.when('/page2', { template: 'page2.html', controller: 'Page2Ctrl' })
	})*/
	.controller('meetingsCtrl', function($scope, $http, $location, localStorageService) {

		//initialize
		$scope.now = new Date();
		$scope.selected_day = $scope.now.getDay();
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
		});

		$scope.$watch('filteredMeetings', function() {
		     $scope.scroll_to_now();
		}, true);
		
		$scope.get_next_meeting = function() {
			if (typeof $scope.filteredMeetings === 'undefined') return false;
			var timestring = $scope.now.getHours() + ':' + $scope.now.getMinutes() + ':' + $scope.now.getSeconds();
			for (var i = 0; i < $scope.filteredMeetings.length; i++) {
				if ($scope.filteredMeetings[i].time + ':00' > timestring) return $scope.filteredMeetings[i];
			}
			return false;
		}
		
		$scope.scroll_to_now = function() {
			var target = (meeting = $scope.get_next_meeting()) ? $("#" + meeting.id).offset().top - 44 : 0;
			if ($("div.height").height() <= $(window).height() - 44) target = 0;
			window.console.log('scrolling to ' + target);
			$('html, body').animate({
				scrollTop: target
			}, 0);
		}

		$scope.format_day = function() {
			//if ($scope.selected_day == '') return "Any Day";
			return $scope.days[$scope.selected_day]['value'];
		}

		$scope.format_region = function() {
			if ($scope.selected_region == '') return "";
			for (var i = 0; i < $scope.regions.length; i++) {
				if ($scope.regions[i].id == $scope.selected_region) {
					return $scope.regions[i].value;
				}
			}
		}

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

		$scope.set_day = function(day) {
			$scope.selected_day = day.id;
		 	$("#collapse").collapse("hide");
		}

		$scope.set_region = function(region) {
			$scope.selected_region = region.id;
		 	$("#collapse").collapse("hide");
		}

	});

	$(function(){
		$(window).on('scroll', function() {
			console.log( $(this).scrollTop()
		);
	});

})
addToHomescreen();

(function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
e=o.createElement(i);r=o.getElementsByTagName(i)[0];
e.src='//www.google-analytics.com/analytics.js';
r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
ga('create','UA-80350-22');ga('send','pageview');
