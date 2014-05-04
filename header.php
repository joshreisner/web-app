<!DOCTYPE html>
<html <?php language_attributes()?>>
	<head>
		<meta http-equiv="Content-Type" content="<?php bloginfo('html_type')?>; charset=<?php bloginfo('charset')?>">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
		<link rel="pingback" href="<?php bloginfo('pingback_url')?>">
		<title><?php wp_title('|', true, 'right')?><?php echo get_bloginfo( 'name' ); ?></title>
		<?php wp_head()?>
	</head>
	<body <?php body_class()?>>