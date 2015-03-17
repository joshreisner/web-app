//= include ../../bower_components/jquery/dist/jquery.js
//= include ../../bower_components/add-to-homescreen/src/addtohomescreen.js
//= include ../../bower_components/angular/angular.min.js
//= include ../../bower_components/angular-route/angular-route.js
//= include ../../bower_components/angular-local-storage/dist/angular-local-storage.js
//= include ../../bower_components/bootstrap-sass/assets/javascripts/bootstrap.js

angular
	.module('meetingsApp', ['ngRoute', 'LocalStorageModule'])
	.filter('escape', function() {
		return window.escape;
	})
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	    $locationProvider.html5Mode(true);
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
	}])
	.run(['$rootScope', '$http', 'localStorageService', function($rootScope, $http, localStorageService) {

		//console.log('rootScope starting up');

		$rootScope.now = new Date();
		$rootScope.today = $rootScope.now.getDay();
		$rootScope.selected_day = $rootScope.today;
		$rootScope.selected_region = '';
		$rootScope.scrollPosition = null;
		$rootScope.days = [
			{ id: 0, value: 'Sunday' }, 
			{ id: 1, value: 'Monday' },
			{ id: 2, value: 'Tuesday' }, 
			{ id: 3, value: 'Wednesday' }, 
			{ id: 4, value: 'Thursday' },
			{ id: 5, value: 'Friday' }, 
			{ id: 6, value: 'Saturday' }
		];

		//get stuff out of local storage
		$rootScope.regions   = localStorageService.get('regions') || new Array();
		$rootScope.meetings  = localStorageService.get('meetings') || new Array();
		$rootScope.favorites = localStorageService.get('favorites') || new Array();

		/*get user's location
		$rootScope.userLocation = null;
		if (window.navigator.standalone) {
			navigator.geolocation.getCurrentPosition(foundLocation, noLocation, { timeout: 10000 });
			function foundLocation(position) {
	   			$rootScope.userLocation = position.coords;
			}
			function noLocation() {
				$rootScope.userLocation = false;
			}
		}*/

		//update meetings & regions from our open source WordPress API
		$http
			.get('http://aasanjose.org/wp-admin/admin-ajax.php?action=meetings')
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

		$rootScope.getDistanceInMi = function() {
			if ($rootScope.userLocation === false) return false;
			if ($rootScope.userLocation === null) return null;
			var lat1 = $rootScope.userLocation.latitude;
			var lon1 = $rootScope.userLocation.longitude;
			var lat2 = $rootScope.meeting.latitude;
			var lon2 = $rootScope.meeting.longitude;
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

		$rootScope.format_types = function(types) {
			for (var i = 0; i < types.length; i++) {
				if (types[i] == 'M') return '/ Men';
				if (types[i] == 'W') return '/ Women';
			}
			return '';
		}

		$rootScope.rememberScroll = function(position) {
			//console.log('remembering ' + position);
			if ($rootScope.controller == 'meetings') {
				$rootScope.scrollPosition = position;
			}
		}

	}])
	.controller('meetingsCtrl', ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout) {

		//initialize
		//console.log('meetings controller starting up');
		$rootScope.controller = 'meetings';
		$scope.selected_day = $rootScope.selected_day;
		$scope.selected_region = $rootScope.selected_region;

		//scroll to -- wish this was not a timeout, but have to wait for page to render
		$timeout(function(){
			if ($rootScope.scrollPosition === null) {
				$scope.scroll_to_now();
			} else {
				//console.log('scrolling to remembered position of ' + $rootScope.scrollPosition);
				$scope.scroll_to($rootScope.scrollPosition);
			}
		}, 200);

		$scope.get_next_meeting = function() {
			if (typeof $scope.filteredMeetings === 'undefined') return false;
			var timestring = ($rootScope.now.getHours() < 10 ? '0' : '') + $rootScope.now.getHours() + ':';
			timestring += ($rootScope.now.getMinutes() < 10 ? '0' : '') + $rootScope.now.getMinutes();
			//var timestring = '06:55'; //should scroll you to a 7am meeting
			for (var i = 0; i < $scope.filteredMeetings.length; i++) {
				if ($scope.filteredMeetings[i].time >= timestring) return $scope.filteredMeetings[i];
			}
			return false;
		}
		
		$scope.scroll_to_now = function() {
			//console.log('scrolling to now');
			var position = (meeting = $scope.get_next_meeting()) ? $('#meeting-' + meeting.id).offset().top - 64 : 0;
			$scope.scroll_to(position);
		}

		$scope.scroll_to = function(position) {
			var max = $('div.height').height();
			if (max <= $(window).height() - 64) target = 0;
			if (position > max) target = max;
			//console.log('scrolling to ' + position);
			$('html,body').animate({scrollTop: position}, 0);
		}

		$scope.reset_vars = function() {
			$rootScope.selected_day = $rootScope.now.getDay();
			$rootScope.selected_region = '';
			$timeout(function(){
				$scope.scroll_to_now();
			}, 200);
		 	if ($('#collapse').hasClass('in')) $('#collapse').collapse('hide');
		}

		$scope.format_day = function() {
			//if ($rootScope.selected_day == '') return 'Any Day';
			return $rootScope.days[$rootScope.selected_day]['value'];
		}

		$scope.format_region = function() {
			if ($rootScope.selected_region == '') return '';
			for (var i = 0; i < $rootScope.regions.length; i++) {
				if ($rootScope.regions[i].id == $rootScope.selected_region) {
					return $rootScope.regions[i].value;
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
			$rootScope.selected_day = day.id;
			$scope.selected_day = $rootScope.selected_day;
			$scope.scroll_to(0);
		 	$('#collapse').collapse('hide');
		}

		$scope.set_region = function(region) {
			$rootScope.selected_region = (typeof region === 'undefined') ? '' : region.id;
			$scope.selected_region = $rootScope.selected_region;
			$scope.scroll_to(0);
		 	$('#collapse').collapse('hide');
		}

		//remember scroll position
		$(window).on('scroll', function(){
			//console.log($(this).scrollTop())
			$rootScope.rememberScroll($(this).scrollTop());
		});
	}])
	.controller('meetingDetailCtrl', ['$scope', '$rootScope', '$routeParams', '$window', '$location', 'localStorageService', function($scope, $rootScope, $routeParams, $window, $location, localStorageService) {

		$rootScope.controller = 'detail';

		$scope.$on('$viewContentLoaded', function(event) {
			$window.ga('send', 'pageview', { page: $location.path() });
		});

		$('html,body').animate({scrollTop: 0}, 0);

		//get current meeting info
		$scope.getMeeting = function(slug) {
			for (var i = 0; i < $scope.meetings.length; i++) {
				if ($rootScope.meetings[i].slug == slug) return $rootScope.meetings[i];
			}
			//todo redirect on 404
		}

		$scope.meeting = $scope.getMeeting($routeParams.slug);

		//$scope.meeting.distance = $rootScope.getDistanceInMi();
		
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
	.controller('helpCtrl', ['$scope', '$rootScope', '$window', '$location', function($scope, $rootScope, $window, $location) {
		$rootScope.controller = 'help';

		$scope.$on('$viewContentLoaded', function(event) {
			$window.ga('send', 'pageview', { page: $location.path() });
		});

		$('html,body').animate({scrollTop: 0}, 0);
	}]);

//run thingy to prompt saving web app
addToHomescreen();


//google analytics
(function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
e=o.createElement(i);r=o.getElementsByTagName(i)[0];
e.src='//www.google-analytics.com/analytics.js';
r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
ga('create','UA-80350-22');ga('send','pageview');
