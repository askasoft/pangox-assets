(function($) {
	"use strict";

	$.fn.toggleby = function(s) {
		if (typeof(s) == 'string') {
			s = { toggleby: s };
		}
		s = $.extend({}, $.toggleby.defaults, s);

		return this.each(function() {
			var $a = $(this),
				b = s.toggleby || $a.attr('toggleby'),
				t = b, c = '',
				i = b.indexOf(' ');

			if (i > 0) {
				t = b.substring(0, i);
				c = b.substring(i+1);
			}

			var f = function() {
				$a.toggleClass($a.attr('toggleby-class') || s['class'], s.state($(b).filter(':checked').length));
			};

			$(t).on('change', c, f);

			f();
		});
	};

	$.toggleby = {
		defaults: {
			'class': 'hidden',
			'state': function(n) { return n == 0; }
		}
	};

	// ==================
	$(window).on('load', function() {
		$('[toggleby]').toggleby();
	});
})(jQuery);
