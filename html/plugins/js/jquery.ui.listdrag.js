(function($) {
	"use strict";

	var _d;
	function _dragstart() {
		_d = this;
	}
	function _dragend() {
		_d = null;
	}
	function _dragover(e) {
		e.preventDefault();
		$(this).addClass('dragover');
	}
	function _dragleave() {
		$(this).removeClass('dragover');
	}

	function _drop() {
		var el = this, $l = $(el);

		if (_d && _d !== el) {
			var $d = $(_d), $p = $l.parent(), $cs = $p.children();

			if ($cs.filter(function() { return this === _d; }).length) {
				$p.data('drop', '').trigger('dropstart.listdrag', [ _d, el ]);
				if ($p.data('drop') != 'cancel') {
					$d.insertBefore($l);
					$p.trigger('dropend.listdrag');
				}
			}
		}
		$l.removeClass('dragover');
	}

	$.fn.listdrag = function() {
		$(this).addClass('ui-listdrag')
			.off('.listdrag')
			.on('dragstart.listdrag', "li", _dragstart)
			.on('dragend.listdrag', "li", _dragend)
			.on('dragover.listdrag', "li", _dragover)
			.on('dragleave.listdrag', "li", _dragleave)
			.on('drop.listdrag', "li", _drop)
			.each(function() {
				var $t = $(this);
				if (!$t.hasClass('horizontal')) {
					$t.addClass('vertical');
				}
			})
			.children('li').prop('draggable', true);
		return this;
	}

	// ==================
	$(window).on('load', function() {
		$('[data-spy="listdrag"]').listdrag();
	});
})(jQuery);
