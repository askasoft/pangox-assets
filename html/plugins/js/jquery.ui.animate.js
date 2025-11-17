(function($) {
	"use strict";

	$.each({
		scaleIn: 'show',
		scaleOut: 'hide',
		scaleToggle: 'toggle'
	}, function(fn, op) {
		$.fn[fn] = function(speed, easing, callback) {
			var opt = $.speed(speed, easing, callback), old = opt.step;
			opt.step = function(s) {
				$(this).css({ transform: 'scale(' + s + ')' });
				if (old) {
					old.call(this, s);
				}
			};
			return this.animate({ opacity: op }, opt);
		};
	});

	$.each({
		zoomIn: 'show',
		zoomOut: 'hide',
		zoomToggle: 'toggle'
	}, function(fn, op) {
		$.fn[fn] = function(speed, easing, callback) {
			return this.animate({ zoom: op }, $.speed(speed, easing, callback));
		};
	});

	$.each({
		slideIn: 'show',
		slideOut: 'hide',
		slideInOut: 'toggle'
	}, function(fn, op) {
		$.fn[fn] = function(speed, easing, callback) {
			var props = {
				width: op,
				paddingLeft: op,
				paddingRight: op,
				marginLeft: op,
				marginRight: op
			}
			return this.animate(props, $.speed(speed, easing, callback));
		};
	});

})(jQuery);
