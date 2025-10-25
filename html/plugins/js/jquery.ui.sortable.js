(function($) {
	'use strict';

	function sortable_onclick(evt) {
		var $e = $(this), o = $e.data('order');

		if (o) {
			if ($e.hasClass('sorted')) {
				if ($e.hasClass('asc')) {
					if (o.charAt(0) != '-') {
						o = '-' + o;
					}
				} else {
					if (o.charAt(0) == '-') {
						o = o.substring(1);
					}
				}
			}

			$e.trigger('sort.sortable', [ o ]);
		}
	}

	function get_field(o) {
		if (o && o.charAt(0) == '-') {
			o = o.substring(1);
		}
		return o;
	}

	function set_order($s, o) {
		if (o) {
			var os = o.split(',');

			$s.find('.sortable').removeClass('sorted desc asc').each(function() {
				var $t = $(this), s = $t.data('order');

				if (s) {
					var f = get_field(s);

					$.each(os, function(i, o) {
						if (o && (s == o || f == get_field(o))) {
							$t.addClass('sorted ' + (o.charAt(0) == '-' ? 'desc' : 'asc'));
							return false;
						}
					});
				}
			});
		}
	}

	$.fn.sortable = function(api, arg) {
		if (api == 'order') {
			set_order(this, arg);
			return this;
		}

		return this.addClass('ui-sortable')
			.off('click.sortable')
			.on('click.sortable', '.sortable', sortable_onclick)
			.each(function() {
				var $t = $(this);
				set_order($t, $t.data('order'));
			});
	};

	// SORTABLE DATA-API
	// ==================
	$(window).on('load', function() {
		$('[data-spy="sortable"]').sortable();
	});
})(jQuery);
