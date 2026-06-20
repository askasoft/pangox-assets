// jQuery Nice Select
// https://github.com/hernansartorio/jquery-nice-select
// Made by Hernán Sartorio
// Modified by Frank Wang

(function($) {
	"use strict";

	function __document_click(evt) {
		if (!$(evt.target).closest('.ui-nice-select').length) {
			$('.ui-nice-select.open').removeClass('open').prev('select').trigger('close.nice_select');
		}
	}

	function _find_focused($d) {
		var $f = $d.find('.focused').not('.filtered').first();
		if (!$f.length) {
			$f = $d.find('.selected').not('.filtered').first();
		}
		return $f;
	}

	function _focus_item($d, $i) {
		if ($i.length > 0) {
			$d.find('.focused').removeClass('focused');
			$i.addClass('focused');

			var $u = $d.children('ul'),
				dt = $u.scrollTop(), dh = $u.height(),
				it = $i.position().top, ih = $i.height();

			if (it < 0) {
				$u.scrollTop(dt + it);
			} else if (it + ih > dh) {
				$u.scrollTop(dt + it + ih - dh);
			}
		}
	}

	function __dropdown_keydown(evt) {
		var $d = $(this), np = 'li:not(.disabled, .filtered)';

		switch (evt.key) {
		case ' ': // Space
		case 'Enter':
			($d.hasClass('open') ? _find_focused($d) : $d).trigger('click');
			return false;
		case 'Escape':
			if ($d.hasClass('open')) {
				$d.trigger('click');
			}
			break;
		case 'Tab':
			if ($d.hasClass('open')) {
				return false;
			}
			break;
		case 'Home':
		case 'End':
		case 'ArrowUp':
		case 'ArrowDown':
		case 'PageUp':
		case 'PageDown':
			if (evt.altKey || evt.ctrlKey || evt.shiftKey) {
				return
			}
			if (!$d.hasClass('open')) {
				$d.trigger('click');
				return
			}

			switch (evt.key) {
			case 'Home':
				_focus_item($d, $d.find('li').not('.filtered').first());
				return false;
			case 'End':
				_focus_item($d, $d.find('li').not('.filtered').last());
				return false;
			case 'ArrowUp':
				var $f = _find_focused($d),
					$p = $f.length ? $f.prevAll(np).first() : $d.find(np).last();
				_focus_item($d, $p);
				return false;
			case 'ArrowDown':
				var $f = _find_focused($d),
					$n = ($f.length ? $f.nextAll(np) : $d.find(np)).first();
				_focus_item($d, $n);
				return false;
			case 'PageUp':
				var $f = _find_focused($d);
				if ($f.length) {
					_focus_item($d, $f);

					var h = $d.children('ul').height();
					$f.prevAll(np).each(function() {
						var $i = $(this);
						_focus_item($d, $i);
						if ($f.position().top >= h) {
							return false;
						}
					});
				}
				return false;
			case 'PageDown':
				var $f = _find_focused($d);
				if ($f.length) {
					_focus_item($d, $f);

					var h = -$f.height();

					$f.nextAll(np).each(function() {
						var $i = $(this);
						_focus_item($d, $i);
						if ($f.position().top <= h) {
							return false;
						}
					});
				}
				return false;
			}
		}
	}

	function __dropdown_click(evt) {
		evt.stopPropagation();

		var $d = $(this), $s = $d.prev('select');

		$('.ui-nice-select').not($d).removeClass('open');
		$d.toggleClass('open');

		if ($d.hasClass('open')) {
			if (!$d.find('.focused').length) {
				// wait for open transition
				setTimeout(function() {
					_focus_item($d, _find_focused($d));
				}, 150);
			}

			// Close when clicking outside
			$(document).on('click.nice_select', __document_click);

			$s.trigger('open.nice_select');
		} else {
			$d.focus().find('.filtered').removeClass('filtered');

			// Unbind existing events in case that the plugin has been initialized before
			$(document).off('.nice_select');

			$s.trigger('close.nice_select');
		}
	}

	function __dropdown_option_click() {
		var $i = $(this), $d = $i.closest('.ui-nice-select');

		$d.find('.focused').removeClass('focused');
		$i.addClass('focused');

		if ($i.hasClass('selected')) {
			return;
		}

		var $s = $d.prev('select'), val = $i.attr('value') || '';

		if ($d.data('multiple')) {
			var vs = $s.val() || [];
			vs.push(val);
			val = vs;
		}
		$s.val(val).trigger('change');
	}

	function _fetch_source($d, $t) {
		var fs = $d.data('source');

		if (fs) {
			var $s = $d.prev('select');

			var callback = function(a) {
				var ss = [];
				
				if ($d.data('multiple')) {
					$s.find('option:selected').each(function() {
						var $o = $(this);
						ss.push({ val: $o.attr('value') || '', lbl: $o.html(), dup: false });
					});
				}

				$s.empty();

				$.each(a, function(i, o) {
					var v = o, t = o, h, e;
					if (Array.isArray(o)) {
						v = o[0];
						t = o[1];
						if (o.length > 2) {
							h = o[2];
						}
					}

					$.each(ss, function(i, s) {
						if (s.val == v) {
							s.dup = true;
							e = true
						}
					});

					var $o = $('<option>').attr('value', v);
					h ? $o.html(h) : $o.text(t);
					if (e) {
						$o.prop('selected', true);
					}
					$s.append($o);
				});

				$.each(ss, function(i, s) {
					if (!s.dup) {
						$s.append($('<option>', { 'class': 'filtered', 'value': s.val, 'selected': true}).html(s.lbl));
					}
				});

				_build_options($s, $d);
			}

			var fetch = function() {
				fs.call($s, $t.text(), callback);
			}

			clearTimeout($d.data('stimer'));
			$d.data('stimer', setTimeout(fetch, $d.data('debounce') || 0));
		}
	}

	function _filter_items($d, $t) {
		var ff = $d.data('filter');

		if (ff) {
			if (typeof(ff) != 'function') {
				ff = function(o, s) {
					return $(o).text().toLowerCase().indexOf(s.toLowerCase().trim()) < 0;
				};
			}

			var filter = function() {
				var s = $t.text(),
					$i = $d.find('li'),
					$f = $i.filter(function() { return ff(this, s); });

				$i.removeClass('filtered');
				$f.addClass('filtered');

				var $a = $i.filter('.focused').not('.filtered').first();
				if (!$a.length) {
					$a = $i.not('.filtered').first();
				}
				_focus_item($d, $a);
			}

			clearTimeout($d.data('ftimer'));
			$d.data('ftimer', setTimeout(filter, $d.data('debounce') || 0));
		}
	}

	// editable only
	function __dropdown_label_input(evt) {
		var $t = $(this), $d = $t.closest('.ui-nice-select');

		_fetch_source($d, $t);
		_filter_items($d, $t);

		if (!$d.hasClass('open')) {
			$d.addClass('open').prev('select').trigger('open.nice_select');
		}
	}

	// multiple only
	function __dropdown_label_click() {
		var $t = $(this), val = $t.attr('value') || '',
			$d = $t.closest('.ui-nice-select'),
			$s = $d.prev('select');

		$t.remove();
		
		$d.find('li').filter(function() { return ($(this).attr('value') || '') == val; }).removeClass('selected');

		var vs = [];
		$d.find('.label').each(function() {
			vs.push($(this).attr('value') || '');
		})
		$s.val(vs);
		return false;
	}

	function __select_change() {
		$(this).each(function() {
			var $s = $(this), vs = $s.val();
			var $d = $s.next('.ui-nice-select');

			var eq = Array.isArray(vs)
				? function(v, a) { return a.includes(v); }
				: function(v, a) { return v == a; };

			$d.find('.label, .input').remove();
			$d.find('.selected').removeClass('selected');
			$d.find('li')
				.filter(function() { return eq($(this).attr('value') || '', vs); })
				.addClass('selected')
				.each(function() {
					var $t = $(this);
					$d.append($('<div>', { 'class': 'label', 'value': $t.attr('value') || ''}).html($t.attr('display') || $t.html()));
				});

			if ($d.data('editable')) {
				_create_editor($d);

				_focus_editor($d);
			}
		});
	}

	function _focus_editor($d) {
		var el = $d.find('.input')[0];
		
		// Focus the element first
		el.focus();
		
		// Create a new selection range
		var rng = document.createRange(), sel = window.getSelection();
		
		// Select all children inside the contenteditable element
		rng.selectNodeContents(el);
		
		// Collapse the range to the very end (false means collapse to end)
		rng.collapse(false);
		
		// Clear any existing user selections
		sel.removeAllRanges();
		
		// Apply the new range to move the cursor
		sel.addRange(rng);
	}

	function _create_editor($d) {
		if (!$d.data('multiple')) {
			var $c = $d.find('.label');
			if ($c.length) {
				$c.removeClass('label').addClass('input').attr('contenteditable', 'plaintext-only');
				return;
			}
		}
		$d.append($('<div>', { 'class': 'input', 'value': '', 'contenteditable': 'plaintext-only' }));
	}

	function _build_labels($s, $d) {
		$s.find('option:selected').each(function() {
			var $op = $(this);
			$d.append($('<div>', { 'class': 'label', 'value': $op.val()}).html($op.attr('display') || $op.html()));
		});
	}

	function _build_options($s, $d) {
		var $ul = $d.children('ul').empty();

		$s.find('option').each(function() {
			var $op = $(this);

			$ul.append($('<li>')
				.attr({ value: $op.val(), display: ($op.attr('display') || '') })
				.addClass(($op.attr('class') || '') + ($op.is(':selected') ? ' selected' : '') + ($op.is(':disabled') ? ' disabled' : ''))
				.html($op.html())
			);
		});
	}

	function init($s, sc) {
		var $ul = $('<ul tabindex="-1">'),
			$d = $('<div>')
				.addClass('ui-nice-select')
				.addClass($s.attr('class') || '')
				.addClass(sc.disabled ? 'disabled' : '')
				.addClass(sc.multiple ? 'multiple' : '')
				.attr('tabindex', sc.disabled ? "-1" : ($s.attr('tabindex') || '0'))
				.append($ul);

		if (sc.editable) {
			$d.addClass('editable');
		}

		// save config
		$d.data(sc);

		_build_labels($s, $d);
		_build_options($s, $d);

		// Open, close
		$d.on('click', __dropdown_click);

		// Keyboard events
		$d.on('keydown', __dropdown_keydown);

		// Option click
		$d.on('click', 'li:not(.disabled)', __dropdown_option_click);

		// multiple
		if (sc.multiple) {
			$d.on('click', '.label', __dropdown_label_click)
		}

		$s.after($d).on('change.nice_select', __select_change);

		// editable
		if (sc.editable) {
			_create_editor($d);

			$d.on('input', '.input', __dropdown_label_input);

			$s.on('close.nice_select', __select_change);
		}
	}

	function update($s, c) {
		var $d = $s.next('.ui-nice-select');

		if ($d.length) {
			$d.data($.extend({}, $d.data(), c));
			_build_options($s, $d);
		}
	}

	function destroy($s) {
		var $d = $s.next('.ui-nice-select');

		if ($d.length) {
			$d.remove();
			$s.off('.nice_select').removeClass('ui-nice-select-hidden');
		}

		if ($('.ui-nice-select').length == 0) {
			$(document).off('.nice_select');
		}
	}

	var api = {
		'update': update,
		'destroy': destroy
	};

	$.niceSelect = {
		defaults: {
			disabled: false,
			multiple: false,

			editable: false,
			debounce: 300,
			filter: true,
			source: null // function(input, callback([]))
		}
	};

	function _options($s) {
		var e = $s.attr('editable'), e = (e === '' || e === 'true');
		return {
			editable: e,
			disabled: $s.prop('disabled'),
			multiple: $s.prop('multiple')
		};
	}

	$.fn.niceSelect = function(c, o) {
		if (typeof c == 'string') {
			this.each(function() {
				api[c]($(this), o);
			});
			return this;
		}

		// Hide native select and create custom markup
		this.each(function() {
			var $s = $(this);
			if ($s.next().hasClass('ui-nice-select')) {
				update($s, c);
			} else {
				init($s, $.extend({}, $.niceSelect.defaults, _options($s), c));
			}
		}).addClass('ui-nice-select-hidden');
		return this;
	};

	// niceSelect DATA-API
	// ==================
	$(window).on('load', function() {
		$('[data-spy="niceSelect"]').niceSelect();
	});

})(jQuery);
