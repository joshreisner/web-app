<!doctype html>
<html lang="en" ng-app>
	<head>
	    <meta charset="UTF-8">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
		<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no">
	    <title>Meeting List</title>
		<link rel="apple-touch-icon-precomposed" href="<?php echo get_template_directory_uri()?>/assets/img/apple-touch-icon.png">
		<link rel="apple-touch-startup-image" href="<?php echo get_template_directory_uri()?>/assets/img/startup.png">
		<link rel="apple-touch-startup-image" href="<?php echo get_template_directory_uri()?>/assets/img/startup-640-1096.png" sizes="640x1096">
		<?php wp_head()?>
		<?php
		$meetings = get_posts(array(
			'post_type'		=>'meetings',
			'numberposts'	=>-1,
			'orderby'		=>'meta_value',
			'meta_key'		=>'time',
			'order'			=>'asc',
		));
		foreach ($meetings as &$meeting) {
			$custom = get_post_meta($meeting->ID);
			list($hours, $minutes) = explode(':', $custom['time'][0]);
			$meeting = array(
				'title'			=>$meeting->post_title,
				'map'			=>'http://maps.apple.com/?q=' . urlencode($custom['address'][0]),
				'time_formatted'=>meetings_format_time($custom['time'][0]),
				'hours'			=>$hours,
				'minutes'		=>$minutes,
				'location'		=>$custom['location'][0],
				'region'		=>$custom['region'][0],
				'address'		=>substr($custom['address'][0], 0, strpos($custom['address'][0], ',')),
			);
		}
		?>
		<script>
		var meetings = <?php echo json_encode($meetings)?>
		</script>
	</head>
	<body>
	    <div class="container">
			<div class="navbar navbar-default navbar-fixed-top">
				<form class="navbar-form row">
					<div class="col-xs-6 day">
						<select class="form-control" id="day">
							<?php foreach ($days as $key=>$day) {?>
							<option value="<?php echo $key?>"<?php selected($key, date('w'))?>><?php echo $day?></option>
							<?php }?>
						</select>
					</div>
					<div class="col-xs-6 city">
						<select class="form-control col-sm-6" id="city">
							<option value="" selected="selected">Everywhere</option>
							<?php foreach ($regions as $key=>$region) {?>
							<option value="<?php echo $key?>"><?php echo $region?></option>
							<?php } ?>
						</select>
					</div>
				</form>
			</div>
			<ul class="list-group">
				<li class="list-group-item" 
					data-hours="{{ meeting.hours }}" 
					data-minutes="{{ meeting.minutes }}"
					ng-repeat="meeting in filteredMeetings = (meetings | filter:{day:day, region:region} | orderBy:order)"
					>
					<a href="{{ meeting.map }}">
						<h4>{{ meeting.time_formatted}}</h4>
						<i class="glyphicon glyphicon-map-marker"></i>
					</a>
					<div class="content">
						<h4 class="list-group-item-heading">{{ meeting.title }}</h4>
						<address>
							{{ meeting.location }}<br>
							{{ meeting.address }}<br>
							{{ meeting.region }}<br>
						</address>
					</div>
				</li>
			</ul>
		</div>
		<?php wp_footer(); ?>
	</body>
</html>
