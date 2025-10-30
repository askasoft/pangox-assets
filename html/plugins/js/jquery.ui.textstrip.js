(function($) {
	"use strict";

	var E = 'blur.textstrip', R = /^[\s\u0085\u00a0\u2000\u3000]+|[\s\u0085\u00a0\u2000\u3000]+$/g;

	function _textstrip() {
		var $t = $(this), a = $t.attr('textstrip') || '';
		if (a != 'false') {
			$t.val(($t.val() || '').replace(R, ''));
		}
	}

	$.fn.textstrip = function() {
		return this.off(E).on(E, _textstrip);
	};
	
	// ==================
	$(window).on('load', function () {
		$('[textstrip]').textstrip();
	});
})(jQuery);
