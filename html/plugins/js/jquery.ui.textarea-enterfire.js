(function($) {
	"use strict";

	var E = 'keyup.enterfire';

	function _enterfire(evt) {
		if (evt.ctrlKey && evt.key == 'Enter') {
			var $t = $(this), ef = $t.attr('enterfire') || 'true';
			if (ef == 'true' || ef == 'form' || ef == 'submit') {
				$t.closest('form').submit();
			} else {
				$(ef).click();
			}
		}
	}

	$.fn.enterfire = function() {
		return this.off(E).on(E, _enterfire);
	};

	$(window).on('load', function() {
		$('textarea[enterfire]').enterfire();
	});

})(jQuery);
