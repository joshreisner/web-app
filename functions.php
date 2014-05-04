<?php

add_action('wp_enqueue_scripts', function() {
	wp_enqueue_script('bootstrap',	get_template_directory_uri() . '/bower_components/bootstrap/dist/js/bootstrap.min.js', array('jquery'), true);
	wp_enqueue_style('bootstrap',	get_template_directory_uri() . '/bower_components/bootstrap/dist/css/bootstrap.min.css');
	wp_enqueue_script('add2home',	get_template_directory_uri() . '/bower_components/add-to-homescreen/style/addtohomescreen.css');
	wp_enqueue_style('add2home',	get_template_directory_uri() . '/bower_components/add-to-homescreen/src/addtohomescreen.min.js');
	wp_enqueue_script('main',		get_template_directory_uri() . '/assets/js/main.js');
	wp_enqueue_style('main',		get_template_directory_uri() . '/assets/css/main.css');
});
