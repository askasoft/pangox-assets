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
		if (_droppable(this)) {
			$(this).addClass('dragover');
		}
	}
	function _dragleave() {
		$(this).removeClass('dragover');
	}
	function _drop() {
		var a = _droppable(this);
		if (a) {
			var $l = a[0], $p = a[1], $d = $(_d);

			$p.data('checkorder', true).trigger('dropstart.checkorder', [ _d, this ]);
			if ($p.data('checkorder')) {
				$d.find(':checkbox').prop('checked', $l.find(':checkbox').prop('checked'));
				$d.insertBefore($l);
				$p.trigger('dropend.checkorder');
			}
		}
		$(this).removeClass('dragover');
	}

	function _droppable(el) {
		if (_d && _d !== el) {
			var $l = $(el), $p = $l.parent(), $ls = $p.children('label');

			if ($ls.filter(function() { return this === _d; }).length) {
				$p.data('checkorder', true).trigger('dropstart.checkorder', [ _d, el ]);
				if ($p.data('checkorder')) {
					return [ $l, $p ];
				}
			}
		}
		return false;
	}

	function _click() {
		var $c = $(this), $l = $c.closest('label'), $p = $l.parent();

		$p.data('checkorder', true).trigger('clickstart.checkorder', [ $c[0] ]);
		if ($p.data('checkorder')) {
			$l.fadeOut(200, function() {
				var $h = $c.closest('.ui-checks').find('hr');
				if ($c.prop('checked')) {
					$l.insertBefore($h);
				} else {
					$l.insertAfter($h);
				}
				$l.fadeIn(200, function() {
					$p.trigger('clickend.checkorder');
				});
			});
		}
	}

	$.fn.checkorder = function() {
		var $t = $(this), $h = $t.find('hr');
		if ($h.length == 0) {
			$t.prepend($('<hr>'));
		}
		$t.off('.checkorder')
			.on('click.checkorder', ":checkbox", _click)
			.on('dragstart.checkorder', "label", _dragstart)
			.on('dragend.checkorder', "label", _dragend)
			.on('dragover.checkorder', "label", _dragover)
			.on('dragleave.checkorder', "label", _dragleave)
			.on('drop.checkorder', "label", _drop);
		$t.children('label').prop('draggable', true);
		return this;
	}

	// ==================
	$(window).on('load', function() {
		$('.ui-checks.ordered').checkorder();
	});
})(jQuery);
