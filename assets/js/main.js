//= include ../../bower_components/jquery/dist/jquery.js
//= include ../../bower_components/add-to-homescreen/src/addtohomescreen.js
//= include ../../bower_components/angular/angular.min.js
//= include ../../bower_components/angular-route/angular-route.js
//= include ../../bower_components/angular-local-storage/angular-local-storage.min.js
//= include ../../bower_components/bootstrap-sass/dist/js/bootstrap.js

angular
	.module('meetingsApp', ['ngRoute', 'LocalStorageModule'])
	.filter('escape', function() {
		return window.escape;
	})
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider.
			when('/', {
				templateUrl: '/partials/meetings.html',
				controller: 'meetingsCtrl'
			}).
			when('/help', {
				templateUrl: '/partials/help.html',
				controller: 'helpCtrl'
			}).
			when('/meetings/:slug', {
				templateUrl: '/partials/meeting-detail.html',
				controller: 'meetingDetailCtrl'
			}).
			otherwise({
				redirectTo: '/'
			});
	    $locationProvider.html5Mode(true);
	}])
	.run(['$rootScope', '$http', 'localStorageService', function($rootScope, $http, localStorageService) {

		//populate days dropdown
		$rootScope.days = [
			{ id: 0, value: "Sunday" }, 
			{ id: 1, value: "Monday" },
			{ id: 2, value: "Tuesday" }, 
			{ id: 3, value: "Wednesday" }, 
			{ id: 4, value: "Thursday" },
			{ id: 5, value: "Friday" }, 
			{ id: 6, value: "Saturday" }
		];

		//get stuff out of local storage
		$rootScope.regions   = localStorageService.get('regions') || new Array();
		$rootScope.meetings  = localStorageService.get('meetings') || new Array();
		$rootScope.favorites = localStorageService.get('favorites') || new Array();

		//get user's location
		$rootScope.userLocation = null;
		if (window.navigator.standalone) {
			navigator.geolocation.getCurrentPosition(foundLocation, noLocation, { timeout: 10000 });
			function foundLocation(position) {
	   			$rootScope.userLocation = position.coords;
			}
			function noLocation() {
				$rootScope.userLocation = false;
			}
		}

		//update meetings & regions from our open source WordPress API
		$http
			.get("http://aasanjose.org/wp-admin/admin-ajax.php?action=meetings")
			.success(function(data, status, headers, config) {
				$rootScope.meetings = data;

				var regions = new Array();
				var regionKeys = new Array(); //faster, i think, than looping

				for (var i = 0; i < $rootScope.meetings.length; i++) {
					//pre-format the meeting types, because on-the-fly formatting was throwing off scroll
					$rootScope.meetings[i].types_formatted = $rootScope.format_types($rootScope.meetings[i].types);

					//set favorite
					if ($rootScope.favorites) {
						$rootScope.meetings[i].favorite	= ($rootScope.favorites.indexOf($rootScope.meetings[i].id) != -1);
					} else {
						$rootScope.meetings[i].favorite = false;
					}

					//remember region
					if (regionKeys.indexOf($rootScope.meetings[i].region) == -1) {
						regionKeys[regionKeys.length] = $rootScope.meetings[i].region;
						regions[regions.length] = {
							id: $rootScope.meetings[i].region_id,
							value: $rootScope.meetings[i].region
						}
					}
				}

				//sort regions by object value
				function compare(a, b) {
					if (a.value < b.value) return -1;
					if (a.value > b.value) return 1;
					return 0;
				}
				regions.sort(compare);

				//export new regions variable and save to local storage
				$rootScope.regions = regions;
				localStorageService.add('meetings', $rootScope.meetings);
				localStorageService.add('regions', regions);
			});

		$rootScope.format_types = function(types) {
			for (var i = 0; i < types.length; i++) {
				if (types[i] == 'M') return "Men";
				if (types[i] == 'W') return "Women";
			}
			return '';
		}

	}])
	.controller('meetingsCtrl', ['$scope', function($scope) {

		//initialize
		$scope.now = new Date();
		$scope.selected_day = $scope.now.getDay();
		$scope.selected_region = "";

		//scroll to current time when filter is updated
		$scope.$watch('filteredMeetings', function() {
		     $scope.scroll_to_now();
		}, true);
		
		$scope.get_next_meeting = function() {
			if (typeof $scope.filteredMeetings === 'undefined') return false;
			var timestring = ($scope.now.getHours() < 10 ? '0' : '') + $scope.now.getHours() + ':';
			timestring += ($scope.now.getMinutes() < 10 ? '0' : '') + $scope.now.getMinutes();
			//var timestring = '06:55'; //should scroll you to a 7am meeting
			for (var i = 0; i < $scope.filteredMeetings.length; i++) {
				if ($scope.filteredMeetings[i].time >= timestring) return $scope.filteredMeetings[i];
			}
			return false;
		}
		
		$scope.scroll_to_now = function() {
			var target = (meeting = $scope.get_next_meeting()) ? $("#meeting-" + meeting.id).offset().top - 64 : 0;
			var max = $("div.height").height();
			if (max <= $(window).height() - 64) target = 0;
			if (target > max) target = max;
			$('html,body').animate({scrollTop: target}, 0);
		}

		$scope.reset_vars = function() {
			$scope.selected_day = $scope.now.getDay();
			$scope.selected_region = "";
			$scope.scroll_to_now();
		 	if ($("#collapse").hasClass("in")) $("#collapse").collapse("hide");
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

		$scope.set_day = function(day) {
			$scope.selected_day = day.id;
		 	$("#collapse").collapse("hide");
		}

		$scope.set_region = function(region) {
			$scope.selected_region = (typeof region === 'undefined') ? "" : region.id;
		 	$("#collapse").collapse("hide");
		}
	}])
	.controller('meetingDetailCtrl', ['$scope', '$rootScope', '$routeParams', '$window', '$location', 'localStorageService', function($scope, $rootScope, $routeParams, $window, $location, localStorageService) {

		$scope.$on('$viewContentLoaded', function(event) {
			$window.ga('send', 'pageview', { page: $location.path() });
		});

		$('html,body').animate({scrollTop: 0}, 0);

		//get current meeting info
		$scope.getMeeting = function(slug) {
			for (var i = 0; i < $scope.meetings.length; i++) {
				if ($scope.meetings[i].slug == slug) return $scope.meetings[i];
			}
			//todo redirect on 404
		}

		$scope.meeting = $scope.getMeeting($routeParams.slug);

		$scope.getDistanceInMi = function() {
			if ($scope.userLocation === false) return false;
			if ($scope.userLocation === null) return null;
			var lat1 = $scope.userLocation.latitude;
			var lon1 = $scope.userLocation.longitude;
			var lat2 = $scope.meeting.latitude;
			var lon2 = $scope.meeting.longitude;
			var R = 6371; // Radius of the earth in km
			var dLat = deg2rad(lat2-lat1);  // deg2rad below
			var dLon = deg2rad(lon2-lon1); 
			var a = 
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
				Math.sin(dLon/2) * Math.sin(dLon/2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c; // Distance in km
			return Math.round((d * 0.621371) * 100) / 100;
		}

		$scope.meeting.distance = $scope.getDistanceInMi();
		
		function deg2rad(deg) {
			return deg * (Math.PI/180);
		}

		$scope.types = {
			'H': 'Chips', 
			'C': 'Closed', 
			'G': 'Gay',
			'L': 'Lesbian',
			'M': 'Men Only', 
			'O': 'Open',
			'S': 'Spanish',
			'X': 'Wheelchair Accessible',
			'W': 'Women Only',
			'Y': 'Young People'
		}

		$scope.set_favorite = function() {
			if ($scope.meeting.favorite === true) {
				//unfavorite
				var i = $scope.favorites.indexOf($scope.meeting.id);
				if (i != -1) $scope.favorites.splice(i, 1);
				$scope.meeting.favorite = false;
			} else {
				//set
				$scope.meeting.favorite = true;
				var i = $scope.favorites.indexOf($scope.meeting.id);
				if (i == -1) $scope.favorites[$scope.favorites.length] = $scope.meeting.id;
			}

			//save changes
			for (var i = 0; i < $scope.meetings.length; i++) {
				if ($scope.meetings[i].id == $scope.meeting.id) $scope.meetings[i].favorite = $scope.meeting.favorite;
			}
			
			localStorageService.add('meetings', $scope.meetings);
			localStorageService.add('favorites', $scope.favorites);

		}
	}])
	.controller('helpCtrl', ['$window', '$location', function($window, $location) {
		$scope.$on('$viewContentLoaded', function(event) {
			$window.ga('send', 'pageview', { page: $location.path() });
		});

		$('html,body').animate({scrollTop: 0}, 0);
	}]);

/* for debugging scroll
$(function(){
	$(window).on('scroll', function(){
		window.console.log($(this).scrollTop());
	});
}); */

//run thingy to prompt saving web app
addToHomescreen();

//google analytics
(function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
e=o.createElement(i);r=o.getElementsByTagName(i)[0];
e.src='//www.google-analytics.com/analytics.js';
r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
ga('create','UA-80350-22');ga('send','pageview');
