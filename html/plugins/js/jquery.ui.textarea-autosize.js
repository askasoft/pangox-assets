(function($) {
	"use strict";

	function _autosize() {
		var $t = $(this), o = $t.outerHeight();

		$t.css('height', 'auto');
		var n = $t.prop('scrollHeight');
		$t.outerHeight(n);

		if (o != n) {
			$t.trigger('resize');
		}
	}

	var E = 'input.autosize';

	$.fn.autosize = function() {
		return this.off(E).on(E, _autosize).css({
			'overflow-y': 'hidden',
			'resize': 'none'
		}).trigger('input');
	};

	$(window).on('load', function() {
		$('textarea[autosize]').autosize();
	});

})(jQuery);
