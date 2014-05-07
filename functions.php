<?php
date_default_timezone_set('America/Los_Angeles');

add_action('wp_ajax_nopriv_meetings', 'meetings');
add_action('wp_ajax_meetings', 'meetings');

function meetings() {
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
	wp_send_json($meetings);
}


add_action('wp_enqueue_scripts', function() {
	wp_enqueue_script('bootstrap',	get_template_directory_uri() . '/bower_components/bootstrap/dist/js/bootstrap.min.js', array('jquery'), true);
	wp_enqueue_style('bootstrap',	get_template_directory_uri() . '/bower_components/bootstrap/dist/css/bootstrap.min.css');
	wp_enqueue_script('add2home',	get_template_directory_uri() . '/bower_components/add-to-homescreen/src/addtohomescreen.min.js');
	wp_enqueue_style('add2home',	get_template_directory_uri() . '/bower_components/add-to-homescreen/style/addtohomescreen.css');
	wp_enqueue_script('angularjs',	get_template_directory_uri() . '/bower_components/angular/angular.min.js');
	wp_enqueue_script('angular',	get_template_directory_uri() . '/assets/js/angular.js');
	wp_enqueue_script('main',		get_template_directory_uri() . '/assets/js/main.js');
	wp_enqueue_style('main',		get_template_directory_uri() . '/assets/css/main.css');
});
