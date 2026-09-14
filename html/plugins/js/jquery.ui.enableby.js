(function($) {
	"use strict";

	$.fn.enableby = function(s) {
		return this.each(function() {
			var $a = $(this),
				b = s || $a.attr('enableby'),
				t = b, c = '',
				i = b.indexOf(' ');

			if (i > 0) {
				t = b.substring(0, i);
				c = b.substring(i+1);
			}

			var f = function() {
				$a.prop('disabled', $(b).filter(':checked').length == 0);
			};

			$(t).on('change', c, f);

			f();
		});
	};


	// ==================
	$(window).on('load', function() {
		$('[enableby]').enableby();
	});
})(jQuery);
