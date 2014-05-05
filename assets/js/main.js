jQuery(function(){
	
	function scrollToNow() {
		var d = new Date();
		var h = d.getHours();
		var m = d.getMinutes();
		var w = d.getDay();

		var days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

		if (jQuery("#day").val() != days[w]) return scrollTo(0);

		jQuery(".list-group-item").each(function(){
			if ((jQuery(this).attr("data-hours") == h) && (jQuery(this).attr("data-minutes") > m)) {
				return scrollTo(jQuery(this).offset().top - 50);
			} else if (jQuery(this).attr("data-hours") > h) {
				return scrollTo(jQuery(this).offset().top - 50);
			}
		});

		jQuery(".list-group-item").css({visibility:'visible'});
	}

	scrollToNow();

	function scrollTo(y) {
		jQuery("body").scrollTop(y);
		jQuery(".list-group-item").css({visibility:'visible'});
		return false;
	}

	//ajax
	jQuery(".navbar").on("change", "select", function(){
		jQuery.get("/ajax", { day: jQuery("#day").val(), city: jQuery("#city").val() }, function(data){
			jQuery(".list-group").html(data);
			scrollToNow();
		});
	});
});