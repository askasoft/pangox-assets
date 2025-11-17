// jQuery toast plugin created by Kamran Ahmed copyright MIT license 2015 (modified by Frank Wang)
(function($) {
	"use strict";

	function setOptions(os, base, options) {
		var o = {};

		if ((typeof(options) == 'string') || Array.isArray(options)) {
			o.message = options;
		} else {
			o = options;
		}
		$.extend(os, base, o);
	}

	function setup($t, os) {
		$t = $t || $('<div class="ui-toast-single"></div>');

		$t.empty();

		// For the loader on top
		$t.append($('<span class="ui-toast-loader"></span>'));

		if (os.closeable) {
			$t.append($('<span class="ui-toast-close">&times;</span>'));
		}

		var m = os.html ? 'html' : 'text';
		if (os.heading) {
			$t.append($('<h4 class="ui-toast-heading">')[m](os.heading));
		}

		var $c = $('<div class="ui-toast-content">').appendTo($t);
		var t = os.message || os.text;
		if (Array.isArray(t)) {
			var $ul = $('<ul class="ui-toast-list">');
			$.each(t, function(i, t) {
				if (t) {
					$ul.append($('<li>')[m](t));
				}
			});
			$c.append($ul);
		} else {
			$c.append($('<div class="ui-toast-text">')[m](t));
		}

		if (os.bgColor !== false) {
			$t.css("background-color", os.bgColor);
		}

		if (os.textColor !== false) {
			$t.css("color", os.textColor);
		}

		if (os.textAlign) {
			$t.css('text-align', os.textAlign);
		}

		if (os.icon !== false) {
			$t.addClass('has-icon ' + os.icon);
		}

		if (os['class'] !== false) {
			$t.addClass(os['class'])
		}

		return $t;
	}

	function bindToast($t, os) {
		$t.unbind();

		if (os.timeout) {
			$t.on('shown.toast', function() {
				showLoader($t, os);
				bindHover($t, os);
			});
		}

		$t.find('.ui-toast-close').on('click', function(e) {
			e.preventDefault();
			transitionOut($t, os);
		});

		if (typeof(os.beforeShow) == 'function') {
			$t.on('show.toast', function() {
				os.beforeShow($t);
			});
		}

		if (typeof(os.afterShown) == 'function') {
			$t.on('shown.toast', function() {
				os.afterShown($t);
			});
		}

		if (typeof(os.beforeHide) == 'function') {
			$t.on('hide.toast', function() {
				os.beforeHide($t);
			});
		}

		if (typeof(os.afterHidden) == 'function') {
			$t.on('hidden.toast', function() {
				os.afterHidden($t);
			});
		}

		if (typeof(os.onClick) == 'function') {
			$t.on('click.toast', function() {
				os.onClick($t);
			});
		}
	}

	function stack(p, $t, os) {
		var id = ('ui-toast-stack-' + p), $c = $('#'+id);
		if ($c.length === 0) {
			$c = $('<div>', {
				"id": id,
				"class": "ui-toast-stack",
				"role": "alert",
				"aria-live": "polite"
			});
			$('body').append($c);
		} else if (!os.stack) {
			$c.empty();
		}

		$c.find('.ui-toast-single:hidden').remove();
		
		$c.append($t);

		if (os.stack) {
			var $tss = $c.find('.ui-toast-single'), cnt = $tss.length - os.stack;
			if (cnt > 0) {
				$tss.slice(0, cnt).remove();
			}
		}

		return $c;
	}

	function position($t, os) {
		var sp = os.position;

		if (typeof(sp) == 'object') {
			return stack('c', $t, os).css(sp);
		}

		var $c, op = {
			left: 'auto',
			top: 'auto',
			right: 'auto',
			bottom: 'auto'
		};

		switch (sp) {
		case 'center':
			$c = stack('c', $t, os);
			op.left = ($(window).outerWidth() / 2) - $c.outerWidth() / 2;
			op.top = ($(window).outerHeight() / 2) - $c.outerHeight() / 2;
			return $c.css(op);
		case 'bottom':
			op.bottom = 0;
			op.left = 0;
			op.right = 0;
			return stack('b', $t, os).css(op);
		case 'bottom left':
		case 'left bottom':
			op.bottom = 0;
			op.left = 0;
			return stack('bl', $t, os).css(op);
		case 'bottom right':
		case 'right bottom':
			op.bottom = 0;
			op.right = 0;
			return stack('br', $t, os).css(op);
		case 'bottom center':
		case 'center bottom':
			$c = stack('bc', $t, os);
			op.bottom = 0;
			op.left = ($(window).outerWidth() / 2) - $c.outerWidth() / 2;
			return $c.css(op);
		case 'top':
			op.top = 0;
			op.left = 0;
			op.right = 0;
			return stack('t', $t, os).css(op);
		case 'top right':
		case 'right top':
			op.top = 0;
			op.right = 0;
			return stack('tr', $t, os).css(op);
		case 'top left':
		case 'left top':
			op.top = 0;
			op.left = 0;
			return stack('tl', $t, os).css(op);
		case 'top center':
		case 'center top':
		default:
			$c = stack('tc', $t, os);
			op.top = 0;
			op.left = ($(window).outerWidth() / 2) - $c.outerWidth() / 2;
			return $c.css(op);
		}
	}

	function showLoader($t, os) {
		if (os.loader) {
			// 400 is the default time that jquery uses for fade/slide
			// Divide by 1000 for milliseconds to seconds conversion
			var transition = 'width ' + (os.timeout - 400) / 1000 + 's ease-in';

			$t.find('.ui-toast-loader').css({
				'width': '100%',
				'transition': transition,
				'background-color': os.loaderBg
			});
		}
	}

	function hideLoader($t, os) {
		if (os.loader) {
			$t.find('.ui-toast-loader').css({
				'width': '0%',
				'transition': 'none'
			});
		}
	}

	function setHideTimer($t, os) {
		$t.data('timer', setTimeout(function() {
			$t.off('mouseenter mouseleave').removeData('timer');
			transitionOut($t, os);
		}, os.timeout));
	}

	function clearHideTimer($t) {
		var tm = $t.data('timer');
		if (tm) {
			clearTimeout(tm);
		}
	}

	function bindHover($t, os) {
		if (os.stopHideOnHover) {
			$t.hover(function() {
				clearHideTimer($t);
				hideLoader($t, os);
			}, function() {
				setHideTimer($t, os);
				showLoader($t, os);
			});
		}
	}

	function transitionIn($t, os) {
		var tm = 'show';

		switch (os.transition) {
		case 'fade':
			tm = 'fadeIn';
			break;
		case 'slide':
			tm = 'slideDown';
			break;
		}

		$t.hide().trigger('show.toast')[tm](function() {
			$t.trigger('shown.toast');
		});
	}

	function transitionOut($t, os) {
		var tm = 'hide';

		switch (os.transition) {
		case 'fade':
			tm = 'fadeOut';
			break;
		case 'slide':
			tm = 'slideUp';
			break;
		}

		$t.trigger('hide.toast')[tm](function() {
			$t.trigger('hidden.toast');

			if (os.removeAfterHidden) {
				$t.remove();
			}
		});
	}

	function Toast(options) {
		var os = {}, // options
			$t; // toast-single

		setOptions(os, $.toast.defaults, options);
		$t = setup($t, os);
		position($t, os);
		bindToast($t, os);
		transitionIn($t, os);

		if (os.timeout) {
			setHideTimer($t, os);
		}

		var api = {
			hide: function() {
				transitionOut($t, os);
			},
			remove: function() {
				$t.remove();
			},
			update: function(options) {
				setOptions(os, {}, options);
				setup($t, os);
				bindToast($t, os);
			}
		};

		return api;
	}

	$.toast = Toast;

	$.toast.clear = function() {
		$('.ui-toast-stack').remove();
	}

	$.toast.defaults = {
		icon: false,
		html: false,
		heading: '',
		message: '',
		transition: 'fade',
		closeable: true,
		timeout: 5000,
		stack: 5,
		position: 'top center',
		bgColor: false,
		textColor: false,
		textAlign: 'left',
		loader: true,
		loaderBg: '#ccc',
		stopHideOnHover: true,
		removeAfterHidden: true
	};

})(jQuery);
