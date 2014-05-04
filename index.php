<!doctype html>
<html lang="en">
	<head>
	    <meta charset="UTF-8">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
		<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no">
	    <title>Meeting List</title>
		<link rel="apple-touch-icon-precomposed" href="/img/apple-touch-icon.png">
		<link rel="apple-touch-startup-image" href="/img/startup.png">
		<link rel="apple-touch-startup-image" href="/img/startup-640-1096.png" sizes="640x1096">
		<?php wp_head()?>
	</head>
	<body>
	    <div class="container">
			<div class="navbar navbar-default navbar-fixed-top">
				<form class="navbar-form row">
						<div class="col-xs-6 day">
							<select class="form-control" id="day">
								<option value="Sunday"  selected="selected">Sunday</option>
								<option value="Monday" >Monday</option>
								<option value="Tuesday" >Tuesday</option>
								<option value="Wednesday" >Wednesday</option>
								<option value="Thursday" >Thursday</option>
								<option value="Friday" >Friday</option>
								<option value="Saturday" >Saturday</option>
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

				<?php
				$meetings = get_posts('post_type=meetings&numberposts=-1');
				foreach ($meetings as $meeting) {
					$custom = get_post_meta($meeting->ID);
					?>
				<li class="list-group-item" data-hours="6" data-minutes="0">
					<a href="http://maps.apple.com/?q=++1600+Dell+Ave.+%282nd+Floor%29%2C+Campbell+CA">
						<h4>6:00a</h4>
						<i class="glyphicon glyphicon-map-marker"></i>
					</a>
					<div class="content">
						<h4 class="list-group-item-heading"><?php echo $meeting->post_title?></h4>
						<address>
							<?php echo $custom['location'][0]?><br>
							<?php echo substr($custom['address'][0], 0, strpos($custom['address'][0], ','))?><br>
							<?php echo $regions[$custom['region'][0]]?><br>
						</address>
					</div>
				</li>
				<?php }?>
			</ul>
		</div>
		<?php wp_footer(); ?>
	</body>
</html>
