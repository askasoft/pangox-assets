(function($) {
	"use strict";

	function _dragstart(e) {
		e.stopPropagation();
		$(this).addClass('dragging').closest('.ui-tree').data('drag', this);
	}
	function _dragend(e) {
		e.stopPropagation();
		$(this).removeClass('dragging').closest('.ui-tree').data('drag', null);
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
			var dl = a[0], $l = a[1], $t = a[2];

			$t.data('droppable', true).trigger('dropstart.treeview', [ dl,  $l.get(0) ]);
			if ($t.data('droppable')) {
				var $ul = $l.children('ul'), $du = $(dl).parent();
				if (!$ul.length) {
					$ul = $('<ul>');
					$l.append($ul).removeClass('leaf').addClass('node');
				}
				$ul.append(dl);

				if (!$du.find('li').length) {
					$du.parent().removeClass('node').addClass('leaf');
					$du.remove();
				}
				$t.trigger('dropend.treeview');
			}
		}
		$(this).removeClass('dragover');
	}

	function _droppable(el) {
		var $i = $(el), $l = $i.closest('li'), li = $l.get(0), $t = $l.closest('.ui-tree'), dl = $t.data('drag');
		if (dl && dl !== li) {
			// check the drag LI is not drop in it's children
			if ($(dl).find('.item').filter(function() { return this === el; }).length == 0) {
				return [ dl, $l, $t ];
			}
		}
		return false;
	}

	function _click() {
		var $i = $(this);
		if ($i.next('ul').length) {
			_toggle($i.parent());
		}
	}

	function _collapse($n) {
		$n.addClass('collapsed').children('.item').next().slideUp();
	}

	function _expand($n) {
		$n.removeClass('collapsed').children('.item').next().slideDown();
	}

	function _toggle($n) {
		$n.hasClass('collapsed') ? _expand($n) : _collapse($n);
	}

	function collapse($t, $n) {
		_collapse($n || $t.find('li:not(.collapsed .leaf)'));
	}

	function expand($t, $n) {
		_expand($n || $t.find('li.collapsed'));
	}

	function toggle($t, $n) {
		_toggle($n || $t.find('li:not(.leaf)'));
	}

	function dispose($t) {
		$t.off('.treeview').find('li').removeClass('node leaf').prop('draggable', false);
	}

	function init($t) {
		dispose($t);

		$t.addClass('ui-tree').find('li .item').each(function() {
			var $i = $(this), $n = $i.parent();
			if ($i.next('ul').length) {
				$n.addClass('node');
			} else {
				$n.addClass('leaf');
			}
		});

		if ($t.hasClass('clickable')) {
			$t.on('click.treeview', '.item', _click);
		}

		if ($t.hasClass('draggable')) {
			$t.on('dragstart.treeview', "li", _dragstart)
				.on('dragend.treeview', "li", _dragend)
				.on('dragover.treeview', ".item", _dragover)
				.on('dragleave.treeview', ".item", _dragleave)
				.on('drop.treeview', ".item", _drop);

			$t.find('li').prop('draggable', true);
		}
	}

	var api = {
		init: init,
		dispose: dispose,
		collapse: collapse,
		expand: expand,
		toggle: toggle
	};

	$.fn.treeview = function(method, target) {
		// Methods
		if (typeof method == 'string') {
			api[method](this, target);
			return this;
		}

		init(this);
		return this;
	};

	// TREEVIEW DATA-API
	// ==================
	$(window).on('load', function() {
		$('ul[data-spy="treeview"]').treeview();
	});

})(jQuery);
