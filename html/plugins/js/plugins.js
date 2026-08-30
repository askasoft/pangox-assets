(function($) {
	"use strict";

	var _cssHidden = {
		position: 'absolute',
		top: '-9999px',
		left: '-9999px'
	};

	function addFiles(fs, fadd) {
		if (fs) {
			if (typeof (fs) == "string") {
				fs = $(fs);
			}

			if (Array.isArray(fs)) {
				$.each(fs, function(i, f) {
					fadd(f);
				});
			} else {
				$.each(fs, function(n, f) {
					if (Array.isArray(f)) {
						$.each(f, function(i, f) {
							fadd(f, n);
						});
					} else {
						fadd(f, n);
					}
				});
			}
		}
	}

	function addParams(ps, padd) {
		if (ps) {
			function _addParams(n, v) {
				if (Array.isArray(v)) {
					$.each(v, function(i, v) {
						padd(n, v);
					});
				} else {
					padd(n, v);
				}
			}

			if (Array.isArray(ps)) {
				$.each(ps, function(i, d) {
					_addParams(d.name, d.value);
				});
			} else {
				$.each(ps, function(n, v) {
					_addParams(n, v)
				});
			}
		}
	}

	function ajaf(s) {
		var data = new FormData();

		addParams(s.data, function(n, v) {
			data.append(n, v);
		});

		addFiles(s.file, function(f, n) {
			if (f instanceof FileList) {
				$.each(f, function(i, f) {
					data.append(n, f);
				});
				return;
			}

			if (f instanceof File) {
				data.append(n, f);
				return;
			}

			var $f = $(f);
			n = n || $f.attr('name');
			$.each($f.prop('files'), function(i, f) {
				data.append(n, f);
			});
		});

		s = $.extend({method: 'POST'}, s, {
			cache: false,
			contentType: false,
			processData: false,
			data: data
		});
		delete s.file;

		var xhr = $.ajaxSettings.xhr();
		var ufp = s.uprogress, dfp = s.dprogress;
		if (ufp || dfp) {
			if (ufp) {
				xhr.upload.addEventListener('progress', function(e) {
					if (e.lengthComputable) {
						ufp(e.loaded, e.total);
					}
				});
				delete s.uprogress;
			}

			if (dfp) {
				xhr.addEventListener('progress', function(e) {
					if (e.lengthComputable) {
						dfp(e.loaded, e.total);
					}
				});
				delete s.dprogress;
			}
		}

		xhr.addEventListener('readystatechange', function(e) {
			switch (xhr.readyState) {
			case XMLHttpRequest.HEADERS_RECEIVED:
				var cd = xhr.getResponseHeader('Content-Disposition');
				if (cd) {
					xhr.responseType = 'arraybuffer';
					var cds = cd.split(';');
					$.each(cds, function(i, v) {
						var sp = v.indexOf('=');
						if (sp > 0) {
							let k = v.substring(0, sp).trim().toLowerCase();
							if (k == 'filename' || k == 'filename*') {
								var fn = v.substring(sp+1).trim();
								if (fn.length > 1 && fn.charAt(0) == '"' && fn.charAt(fn.length-1) == '"') {
									fn = fn.substring(1, fn.length-1);
								}
								if (k == 'filename*') {
									var cp = fn.indexOf("''");
									if (sp >= 0) {
										fn = fn.substring(cp + 2);
									}
								}
								fn = decodeURIComponent(fn);
								if (!xhr.download || k == 'filename*') {
									xhr.download = fn;
								}
							}
						}
					});
					if (!xhr.download) {
						xhr.download = cd;
					}
				}
				break;
			case XMLHttpRequest.DONE:
				if (xhr.download) {
					var blob = new Blob([xhr.response]),
						url = window.URL.createObjectURL(blob),
						$a = $('<a>', { download: xhr.download, href: url }).css(_cssHidden);
					
					$('body').append($a);
					$a.get(0).click();
					setTimeout(function() {
						window.URL.revokeObjectURL(url);
						$a.remove();
					}, 200);
				}
				break;
			}
		});
		s.xhr = function() {
			return xhr;
		};

		return $.ajax(s);
	}

	$.ajaf = ajaf;

})(jQuery);

(function($) {
	"use strict";

	$.copyToClipboard = function(s) {
		if (window.clipboardData) {
			// ie
			clipboardData.setData('Text', s);
			return;
		}

		var $t = $('<textarea>')
			.css({ width: 0, height: 0 })
			.text(s)
			.appendTo('body');

		$t.get(0).select();

		document.execCommand('copy');

		$t.remove();
	};
})(jQuery);

/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

(function($) {
	"use strict";

	$.cookie = function(name, value, options) {
		options = $.extend({}, $.cookie.defaults, options);
		if (typeof value != 'undefined') { // name and value given, set cookie
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
			}
			// NOTE Needed to parenthesize options.path and options.domain
			// in the following expressions, otherwise they evaluate to undefined
			// in the packed version for some reason...
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		} else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = cookies[i].replace(/^[\s\u3000\u0022]+|[\s\u3000\u0022]+$/g, '');
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};

	$.cookie.defaults = {};

	$.jcookie = function(name, value, options) {
		if (typeof value != 'undefined') { // name and value given, set cookie
			$.cookie(name, btoa(JSON.stringify(value)), options);
		} else {
			try {
				return JSON.parse(atob($.cookie(name)));
			} catch (ex) {
				return {};
			}
		}
	};

})(jQuery);

(function($) {
	"use strict";

	$.fn.disable = function(state) {
		return this.each(function() {
			this.disabled = state;
		});
	};
})(jQuery);
(function($) {
	"use strict";

	$.jcss = function(url) {
		if ($('link[href="' + url + '"]').length) {
			return false;
		}
		$('<link>').attr({ type: 'text/css', rel: 'stylesheet', href: url }).appendTo('head');
		return true;
	};
})(jQuery);

(function($) {
	"use strict";

	var jss = {};

	$.jscript = function(url, callback) {
		if (jss[url]) {
			return false;
		}

		$.getScript(url, callback);
		return true;
	};

	// enable script cache
	$.enableScriptCache = function() {
		$.ajaxPrefilter(function(options, org, xhr) {
			if (options.dataType == 'script' || org.dataType == 'script') {
				options.cache = true;
			}
		});
	}
})(jQuery);

(function($) {
	"use strict";

	$.queryArrays = function(s, f) {
		var qa = [], ss = s.split('&');

		for (var i = 0; i < ss.length; i++) {
			var p = ss[i].split('='),
				k = decodeURIComponent(p[0]),
				v = p.length > 1 ? decodeURIComponent(p[1]) : '';

			if (!f || f == k) {
				qa.push({
					name: k,
					value: v
				});
			}
		}
		return qa;
	};

	$.queryParams = function(s) {
		var qs = {}, ss = s.split('&');

		for (var i = 0; i < ss.length; i++) {
			var p = ss[i].split('='),
				k = decodeURIComponent(p[0]),
				v = p.length > 1 ? decodeURIComponent(p[1]) : '';
			if (k in qs) {
				if (!Array.isArray(qs[k])) {
					qs[k] = [ qs[k] ];
				}
				qs[k].push(v);
			} else {
				qs[k] = v;
			}
		}
		return qs;
	};

})(jQuery);
(function($) {
	"use strict";

	$.fn.replaceClass = function(s, t) {
		return this.removeClass(s).addClass(t);
	};
})(jQuery);
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
(function($) {
	"use strict";

	var E = 'change', P = 'checked';

	$.fn.checkall = function(s) {
		return this.each(function() {
			var $a = $(this),
				b = s || $a.attr('checkall'),
				t = b, f = '',
				i = b.indexOf(' ');

			if (i > 0) {
				t = b.substring(0, i);
				f = b.substring(i+1);
			}

			$a.on(E, function(evt, sup) {
				if (!sup) {
					var c = $a.prop(P);
					$(b)[c ? 'not' : 'filter'](':checked').each(function() {
						$(this).prop(P, c).trigger(E);
					});
				}
			});

			$(t).on(E, f, function() {
				var $b = $(b), bz = $b.length, cz = $b.filter(':checked').length, ca = (bz > 0 && bz == cz);
				if (ca != $a.prop(P)) {
					$a.prop(P, ca).trigger(E, true);
				}
			});
			
			$(b).first().trigger(E);
		});
	};


	// ==================
	$(window).on('load', function() {
		$('[checkall]').checkall();
	});
})(jQuery);
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
(function($) {
	"use strict";

	var C = '.ui-connector';

	function _bezierXYA(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
		var dx = Math.pow(1-t, 2)*(cp1x-sx) + 2*t*(1-t)*(cp2x-cp1x) + t * t * (ex - cp2x);
		var dy = Math.pow(1-t, 2)*(cp1y-sy) + 2*t*(1-t)*(cp2y-cp1y) + t * t * (ey - cp2y);

		return {
			x: Math.pow(1-t,3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
			y: Math.pow(1-t,3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y + 3 * t * t * (1 - t) * cp2y + t * t * t * ey,
			a: -Math.atan2(dx, dy) + 0.5*Math.PI
		};
	}

	function _drawArrow(ctx, op, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
		var c = _bezierXYA(op.arrow, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey),
			z = op.size * 5;

		ctx.save();
		ctx.beginPath();
		ctx.translate(c.x, c.y);
		ctx.rotate(c.a);
		ctx.moveTo(-z, -z);
		ctx.lineTo(z, 0);
		ctx.lineTo(-z, z);
		ctx.lineTo(-z, -z);
		ctx.fillStyle = op.color;
		ctx.fill();
		ctx.restore();
	}

	function _position($t, $e) {
		var nt = $t.get(0), p = { xl: 0, yt: 0 };

		for (var ne = $e.get(0); ne != null && ne != nt; ne = ne.parentNode) {
			p.xl += ne.offsetLeft;
			p.yt += ne.offsetTop;
		}

		p.xr = p.xl + $e.innerWidth();
		p.xc = (p.xl + p.xr) / 2;
		p.yb = p.yt + $e.innerHeight();
		p.ym = (p.yt + p.yb) / 2;
		return p;
	}

	function _bezierPoint(p, k, c) {
		switch (k) {
		case 'l':
			return { px: p.xl, py: p.ym, cx: p.xl - c, cy: p.ym };
		case 'r':
			return { px: p.xr, py: p.ym, cx: p.xr + c, cy: p.ym };
		case 'b':
			return { px: p.xc, py: p.yb, cx: p.xc, cy: p.yb + c };
		case 't':
		default:
			return { px: p.xc, py: p.yt, cx: p.xc, cy: p.yt - c };
		}
	}

	function _draw($t, $c, $fr, $to, op) {
		var fp = _position($t, $fr),
			tp = _position($t, $to),
			sp = _bezierPoint(fp, op.style.slice(0, 1), op.curve),
			ep = _bezierPoint(tp, op.style.slice(1,2), op.curve);

		var dx, dy;
		switch (op.style) {
		case 'lr':
			dy = sp.px > ep.px;
			break;
		case 'rl':
			dy = sp.px < ep.px;
			break;
		case 'bt':
			dx = sp.py < ep.py;
		case 'tb':
			dx = sp.py > ep.py;
			break;
		}

		if (dx && Math.abs(sp.cx - ep.cx) < op.delta) {
			sp.cx += op.delta;
			ep.cx -= op.delta;
		}
		if (dy && Math.abs(sp.cy - ep.cy) < op.delta) {
			sp.cy += op.delta;
			ep.cy -= op.delta;
		}

		var ctx = $c.get(0).getContext('2d');

		ctx.beginPath();
		ctx.moveTo(sp.px, sp.py);
		ctx.bezierCurveTo(sp.cx, sp.cy, ep.cx, ep.cy, ep.px, ep.py);
		ctx.lineWidth = op.size;
		ctx.strokeStyle = op.color;
		ctx.stroke();

		_drawArrow(ctx, op, sp.px, sp.py, sp.cx, sp.cy, ep.cx, ep.cy, ep.px, ep.py);
	}

	function _connect($t, op, ls) {
		var $c = $t.children(C);
		if (!$c.length) {
			$t.css('position', 'relative').on('resize', _on_resize);
			$c = $('<canvas>', { 'class': C.substring(1) })
				.css({ 'z-index': -1, position: 'absolute', left: 0, top: 0 })
				.prop({ width: $t.width(), height: $t.height() })
				.data('links', [])
				.appendTo($t);
		}

		ls.forEach(function(a) {
			_draw($t, $c, $(a[0]), $(a[1]), op);
			$c.data('links').push([a[0], a[1], op]);
		});
	}

	function _clear() {
		this.getContext('2d').clearRect(0, 0, this.width, this.height);
	}

	function clear($t) {
		$t.children(C).data('links', []).each(_clear);
	}

	function _on_resize() {
		refresh($(this));
	}

	function refresh($t) {
		$t.children(C).each(function() {
			_clear.apply(this);

			var $c = $(this), $t = $c.parent();
			$c.prop({ width: $t.width(), height: $t.height() });

			($c.data('links') || []).forEach(function(a) {
				_draw($t, $c, $(a[0]), $(a[1]), a[2]);
			});
		});
	}

	function dispose($t) {
		$t.off('resize', _on_resize).children(C).remove();
	}

	$.connector = {
		defaults: {
			style: 'rl',
			arrow: 0.8,
			curve: 200,
			delta: 50,
			color: '#aaa',
			size: 1
		}
	};

	var api = {
		clear: clear,
		refresh: refresh,
		dispose: dispose,
	};

	$.fn.connector = function(a) {
		if (typeof(a) == 'string') {
			api[a](this);
			return this;
		}

		var op, ls;
		if (Array.isArray(a)) {
			op = $.extend({}, $.connector.defaults);
			ls = [].slice.call(arguments, 0);
		} else {
			op = $.extend({}, $.connector.defaults, a);
			ls = [].slice.call(arguments, 1);
		}

		return this.each(function() {
			_connect($(this), op, ls);
		});
	};

})(jQuery);
(function($) {
	"use strict";

	$.fn.enableby = function(s) {
		return this.each(function() {
			var $a = $(this),
				b = s || $a.attr('enableby'),
				t = b, f = '',
				i = b.indexOf(' ');

			if (i > 0) {
				t = b.substring(0, i);
				f = b.substring(i+1);
			}

			$(t).on('change', f, function() {
				$a.prop('disabled', $(b).filter(':checked').length == 0);
			});

			if ($(b).length) {
				$(b).first().trigger('change');
			} else {
				$a.prop('disabled', true);
			}
		});
	};


	// ==================
	$(window).on('load', function() {
		$('[enableby]').enableby();
	});
})(jQuery);
(function($) {
	"use strict";

	function _collapse($f, t) {
		t = t || $f.data('fieldset').hideTransition;
		$f.addClass('collapsing').trigger('collapse.fieldset').children(':not(legend)')[t](function() {
			$f.removeClass('collapsing').addClass('collapsed').trigger('collapsed.fieldset');
		});
	}

	function _expand($f, t) {
		t = t || $f.data('fieldset').showTransition;
		$f.removeClass('collapsed').addClass('expanding').trigger('expand.fieldset').children(':not(legend)')[t](function() {
			$f.removeClass('expanding').trigger('expanded.fieldset');
		});
	}

	function collapse($f, t) {
		if (!$f.hasClass('collapsed')) {
			_collapse($f, t);
		}
	}

	function expand($f, t) {
		if ($f.hasClass('collapsed')) {
			_expand($f, t);
		}
	}

	function toggle($f) {
		$f.hasClass('collapsed') ? _expand($f) : _collapse($f);
	}

	function _click() {
		toggle($(this).closest('fieldset'));
	}

	function _init($f, c) {
		if (!$f.data('fieldset')) {
			c = $.extend({}, $.fieldset.defaults, c);

			var h = c.collapsed || $f.hasClass('collapsed'), E = 'click.fieldset';
	
			$f.data('fieldset', c).addClass('ui-fieldset collapsible' + (h ? ' collapsed' : ''));
			$f.children('legend').off(E).on(E, _click);
			$f.children(':not(legend)').toggle(!h);
		}
	}

	var api = {
		collapse: collapse,
		expand: expand,
		toggle: toggle
	};

	$.fieldset = {
		defaults: {
			showTransition: 'slideDown',
			hideTransition: 'slideUp'
		}
	};

	$.fn.fieldset = function(c) {
		var args = [].slice.call(arguments);

		return this.each(function() {
			var $f = $(this);
			if (typeof(c) == 'string') {
				_init($f);
				args[0] = $f;
				api[c].apply($f, args);
				return;
			}
			_init($f, c);
		});
	};

	// FIELDSET DATA-API
	// ==================
	$(window).on('load', function() {
		$('[data-spy="fieldset"]').fieldset();
	});
})(jQuery);
(function($) {
	"use strict";

	$.fn.focusme = function() {
		var done = false;
		return this.each(function() {
			if (done) {
				return;
			}

			var $i = $(this), a = $i.attr('focusme') || 'true', $a;

			if (a == 'true') {
				$a = $i.find('input,select,textarea,button').not(':hidden,:disabled,[readonly]').eq(0);
				if ($a.length < 1) {
					$a = $i.find('a').not(':hidden,:disabled').eq(0);
					if ($a.length < 1) {
						$a = $i;
					}
				}
			} else if (a != 'false') {
				$a = $i.find(a).eq(0);
			}
			
			if ($a && $a.length) {
				var $w = $(window), st = $w.scrollTop(), sl = $w.scrollLeft();
				$a.focus();
				$(window).scrollTop(st).scrollLeft(sl);
				done = true;
			}
		});
	};

	$(window).on('load', function() {
		$('[focusme]').focusme();
	});

})(jQuery);
(function($) {
	"use strict";

	$(window).on('load', function() {
		$('input[data-action], button[data-action]').off('click.action').on('click.action', function() {
			$(this).closest('form').attr('action', $(this).data('action'));
		});
	});

})(jQuery);

(function($) {
	"use strict";

	$.fn.changeValue = function(v) {
		return this.each(function() {
			var $t = $(this), o = $t.val();

			$t.val(v);
			if (o != v) {
				$t.trigger('change');
			}
		});
	};

	$.fn.formClear = function(trigger) {
		this.find('textarea, select')[trigger ? 'changeValue' : 'val']('');
		this.find('input').each(function() {
			var $i = $(this);
			switch ($i.attr('type')) {
			case 'hidden':
			case 'button':
			case 'submit':
			case 'reset':
				break;
			case 'checkbox':
			case 'radio':
				var oc = $i.prop('checked');
				$i.prop('checked', false);
				if (oc && trigger) {
					$i.trigger('change');
				}
				break;
			default:
				$i[trigger ? 'changeValue' : 'val']('');
			}
		});
		return this;
	};

	$.fn.formValues = function(vs, trigger) {
		if (vs) {
			for (var n in vs) {
				var v = vs[n];
				this.find(':input').filter(function() { return this.name == n; }).each(function() {
					var $i = $(this);
					switch ($i.attr('type')) {
					case 'file':
					case 'button':
					case 'submit':
					case 'reset':
						break;
					case 'checkbox':
						var va = Array.isArray(v) ? v : [ v ];
						var oc = $i.prop('checked'), nc = $.inArray($i.val(), va) >= 0;
						$i.prop('checked', nc);
						if (trigger && nc != oc) {
							$i.trigger('change');
						}
						break;
					case 'radio':
						var oc = $i.prop('checked'), nc = ($i.val() == v);
						$i.prop('checked', nc);
						if (trigger && nc && !oc) {
							$i.trigger('change');
						}
						break;
					default:
						trigger ? $i.changeValue(v) : $i.val(v);
						break;
					}
				});
			}
			return this;
		}

		var m = {}, a = this.serializeArray();
		$.each(a, function(i, v) {
			var ov = m[v.name];
			if (ov === undefined) {
				m[v.name] = v.value;
				return;
			}
			if (Array.isArray(ov)) {
				ov.push(v.value);
				return;
			}
			m[v.name] = [ov, v.value];
		});
		return m;
	};

})(jQuery);

(function($) {
	"use strict";

	$.fn.insertText = function(s, append) {
		return this.each(function() {
			var $t = $(this), tv = $t.val();
			var ss = $t.prop('selectionStart') || (append ? tv.length : 0);
			var tb = tv.substring(0, ss), ta = tv.substring(ss);

			$t.val(tb + s + ta).prop('selectionEnd', tb.length + s.length);
		});
	};

})(jQuery);
(function($) {
	"use strict";

	function linkify(node, c) {
		switch (node.nodeType) {
		case 3: // Text Node
			c.regexp.lastIndex = 0;
			var r = c.regexp.exec(node.nodeValue);
			if (r) {
				var $a = $('<a>', { target: c.target, href: r[0] }).text(r[0]);
				if (c.prepend) {
					$a.prepend(c.prepend);
				}
				if (c.append) {
					$a.append(c.append);
				}

				var m = node.splitText(r.index);
				m.splitText(r[0].length);
				$(m).replaceWith($a);
				return 1;
			}
			break;
		case 1: // Element Node
			if (node.childNodes && !c.ignore.test(node.tagName)) {
				for (var i = 0; i < node.childNodes.length; i++) {
					i += linkify(node.childNodes[i], c);
				}
			}
			break;
		}
		return 0;
	}

	$.linkify = {
		defaults: {
			ignore: /(script|style|a)/i,
			// URLs starting with http://, https://
			regexp: /https?:\/\/[\w~!@#\$%&\*\(\)_\-\+=\[\]\|:;,\.\?\/']+/i,
			target: '_blank',
			prepend: '',
			append: ''
		}
	};

	$.fn.linkify = function(c) {
		c = $.extend({}, $.linkify.defaults, c);

		return this.each(function() {
			linkify(this, c);
			$(this).removeAttr('linkify');
		});
	};


	// ==================
	$(window).on('load', function() {
		$('[linkify]').linkify();
	});
})(jQuery);
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
(function($) {
	"use strict";

	function _clearTimeout($el) {
		//if this element has delayed mask scheduled then remove it
		var t = $el.data("_mask_timeout");
		if (t) {
			clearTimeout(t);
			$el.removeData("_mask_timeout");
		}

		//if this element has unmask timeout scheduled then remove it
		t = $el.data("_unmask_timeout");
		if (t) {
			clearTimeout(t);
			$el.removeData("_unmask_timeout");
		}
	}

	function _stopEvent(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	}

	function doMask($el, c) {
		if ($el.isLoadMasked()) {
			unMask($el);
		} else {
			_clearTimeout($el);
		}

		var fs = ($el.prop('tagName') == 'BODY' ? ' fullscreen' : '');

		var $lm = $('<div>', { 'class': "ui-loadmask" + fs });
		if (c.cssClass) {
			$lm.addClass(c.cssClass);
		}

		var $ll = $('<div class="ui-loadmask-load">');
		if (c.content) {
			$lm.append($(c.content));
		} else {
			var $li = $('<div class="ui-loadmask-icon">'),
				$lt = $('<div class="ui-loadmask-text">');

			$ll.append($li).append($lt);

			if (c.html || c.text) {
				$ll.addClass('ui-loadmask-hasmsg');
				if (c.html) {
					$lt.html(c.html);
				} else {
					$lt.text(c.text);
				}
			}
			$lm.append($ll);
		}

		if ($el.css("position") == "static") {
			$el.addClass("ui-loadmasked-relative");
		}
		if (c.mask) {
			var $m = $('<div>', { 'class': "ui-loadmask-mask" + fs });
			$el.append($m);
		}

		$el.append($lm).addClass("ui-loadmasked");

		if (c.timeout > 0) {
			$el.data("_unmask_timeout", setTimeout(function() {
				unMask($el);
			}, c.timeout));
		}
		if (c.keyboard) {
			$el.on('keydown.loadmask', _stopEvent);
		}
	}

	function unMask($el) {
		_clearTimeout($el);

		$el.off('.loadmask');
		$el.find(".ui-loadmask-mask, .ui-loadmask").remove();
		$el.removeClass("ui-loadmasked ui-loadmasked-relative");
	}

	$.loadmask = {
		defaults: {
			cssClass: '',		// css class for the mask element
			mask: true,			// add mask layer
			keyboard: true,		// add keydown event handler for the mask element to prevent input
			delay: 0,			// delay in milliseconds before element is masked. If unloadmask() is called before the delay times out, no mask is displayed. This can be used to prevent unnecessary mask display for quick processes.
			timeout: 0,			// timeout in milliseconds for automatically unloadmask
		}
	};

	/**
	 * Displays loading mask over selected element(s). Accepts both single and multiple selectors.
	 * @param content  html content that will be add to the loadmask
	 * @param html  html message that will be display
	 * @param text  text message that will be display (html tag will be escaped)
	 */
	$.fn.loadmask = function(c) {
		if (typeof (c) == 'string') {
			c = { text: c };
		}
		c = $.extend({}, $.loadmask.defaults, c);
		return this.each(function() {
			var $el = $(this);
			if (c.delay > 0) {
				$el.data("_mask_timeout", setTimeout(function() {
					doMask($el, c);
				}, c.delay));
			} else {
				doMask($el, c);
			}
		});
	};

	/**
	 * Removes mask from the element(s). Accepts both single and multiple selectors.
	 */
	$.fn.unloadmask = function() {
		return this.each(function() {
			unMask($(this));
		});
	};

	/**
	 * Checks if a single element is masked. Returns false if mask is delayed or not displayed. 
	 */
	$.fn.isLoadMasked = function() {
		return this.hasClass("ui-loadmasked");
	};
})(jQuery);
(function($) {
	"use strict";

	var ws = /[\s\u0085\u00a0\u2000\u3000]/g;

	function split(s) {
		var ss = s.split(ws), rs = [];
		for (var i = 0; i < ss.length; i++) {
			if (ss[i].length) {
				rs.push(ss[i])
			}
		}
		return rs;
	}

	function index_any(s, c) {
		var i = 0;
		while (s.length > 0) {
			for (var j = 0; j < c.markups.length; j++) {
				var m = c.markups[j], l = m.length, t = s.substring(0, l);
				if (t == m || (c.caseInsensitive && t.toLowerCase() == m)) {
					return [i, l]
				}
			}
			s = s.substring(1);
			i++;
		}
		return false;
	}

	function markup(node, c) {
		switch (node.nodeType) {
		case 3: // Text Node
			var r = index_any(node.nodeValue, c);
			if (r) {
				var m = node.splitText(r[0]);
				m.splitText(r[1]);
				$(m).wrap(c.wrap);
				return 1;
			}
			break;
		case 1: // Element Node
			if (node.childNodes && !c.ignore.test(node.tagName)) {
				for (var i = 0; i < node.childNodes.length; i++) {
					i += markup(node.childNodes[i], c);
				}
			}
			break;
		}
		return 0;
	}

	$.markup = {
		defaults: {
			caseInsensitive: true,
			ignore: /(script|style|mark)/i,
			wrap: '<mark></mark>',
		}
	};

	$.fn.markup = function(o) {
		if (Array.isArray(o)) {
			o = { markups: o };
		} else if (typeof(o) == 'string') {
			o = { markup: o };
		}

		return this.each(function() {
			var $t = $(this), c = $.extend({}, $.markup.defaults, o);

			c.markups ||= split(c.markup || $t.attr('markup') || '');
			if (c.markups.length) {
				if (c.caseInsensitive) {
					for (var i = 0; i < c.markups.length; i++) {
						c.markups[i] = c.markups[i].toLowerCase();
					}
				}
				markup(this, c);
			}
			$t.removeAttr('markup');
		});
	};


	// ==================
	$(window).on('load', function() {
		$('[markup]').markup();
	});
})(jQuery);
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
				_filter_items($d, $t, 1);
			};

			var fetch = function() {
				fs.call($s, $t.text(), callback);
			};

			clearTimeout($d.data('stimer'));
			$d.data('stimer', setTimeout(fetch, $d.data('debounce') || 0));
		}
	}

	function _filter_items($d, $t, debounce) {
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
			};

			clearTimeout($d.data('ftimer'));
			$d.data('ftimer', setTimeout(filter, debounce || $d.data('debounce') || 0));
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

	function _build_styles($s, $d) {
		var sc = $d.data();

		$d.attr('tabindex', sc.disabled ? "-1" : ($s.attr('tabindex') || '0'));
		$d.attr('class', 'ui-nice-select')
			.addClass($s.attr('class') || '')
			.removeClass('ui-nice-select-hidden')
			.addClass(sc.disabled ? 'disabled' : '')
			.addClass(sc.multiple ? 'multiple' : '')
			.addClass(sc.editable ? 'editable' : '');
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

	function init($s, c) {
		var sc = $.extend({}, $.niceSelect.defaults, _options($s), c),
			$ul = $('<ul tabindex="-1">'),
			$d = $('<div>').append($ul);

		// save config
		$d.data(sc);

		_build_styles($s, $d);
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

		return $d;
	}

	function update($s, c) {
		var $d = $s.next('.ui-nice-select');

		if ($d.length) {
			$d.remove();
			$d = init($s, c);
			if ($d.hasClass('open')) {
				$d.trigger('click');
			}
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
				init($s, c);
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
(function($) {
	var ArrowClasses = {
		'top left': 'dn hr1 vb',
		'top right': 'dn hl1 vb',
		'top center': 'dn hc vb',
		'bottom left': 'up hr1 vt',
		'bottom right': 'up hl1 vt',
		'bottom center': 'up hc vt',
		'left bottom': 'rt hr vt1',
		'left top': 'rt hr vb1',
		'left middle': 'rt hr vm',
		'right bottom': 'lt hl vt1',
		'right top': 'lt hl vb1',
		'right middle': 'lt hl vm'
	};

	function _position($p, $t, position) {
		var tw = $t.outerWidth(), th = $t.outerHeight(), p = $t.offset();
		var pw = $p.outerWidth(), ph = $p.outerHeight();

		switch (position) {
		case 'top left':
			p.top -= (ph + 11);
			p.left -= (pw - 50);
			break;
		case 'top right':
			p.top -= (ph + 11);
			p.left += (tw - 50);
			break;
		case 'top center':
			p.top -= (ph + 11);
			p.left += (tw - pw) / 2;
			break;
		case 'bottom left':
			p.top += th + 11;
			p.left -= (pw - 50);
			break;
		case 'bottom right':
			p.top += th + 11;
			p.left += (tw - 50);
			break;
		case 'bottom center':
			p.top += th + 11;
			p.left += (tw - pw) / 2;
			break;
		case 'left bottom':
			p.left -= (pw + 11);
			p.top -= 20;
			break;
		case 'left top':
			p.left -= (pw + 11);
			p.top += th - ph + 20;
			break;
		case 'left middle':
			p.left -= (pw + 11);
			p.top -= (ph - th) / 2;
			break;
		case 'right bottom':
			p.left += tw + 11;
			p.top -= 20;
			break;
		case 'right top':
			p.left += tw + 11;
			p.top += th - ph + 20;
			break;
		case 'right middle':
			p.left += tw + 11;
			p.top -= (ph - th) / 2;
			break;
		}

		return p;
	}

	function _in_screen($p, p) {
		var $w = $(window),
			wt = $w.scrollTop(), wl = $w.scrollLeft(),
			wb = wt + $w.height(), wr = wl + $w.width(),
			pr = p.left + $p.outerWidth(), pb = p.top + $p.outerHeight();

		return p.left >= wl && p.left <= wr
			&& p.top >= wt && p.top <= wb
			&& pr >= wl && pr <= wr
			&& pb >= wt && pb <= wb;
	}

	function _positions($p, $t, ps) {
		for (var i = 0; i < ps.length; i++) {
			var p = _position($p, $t, ps[i]);
			p.position = ps[i];
			if (_in_screen($p, p)) {
				return p;
			}
			ps[i] = p;
		}
		return ps[0];
	}

	function _center($p, $w) {
		var p = {
			left: $w.scrollLeft() + ($w.outerWidth() - $p.outerWidth()) / 2,
			top: $w.scrollTop() + ($w.outerHeight() - $p.outerHeight()) / 2
		};

		p.left = (p.left < 10 ? 10 : p.left);
		p.top = (p.top < 10 ? 10 : p.top);
		return p;
	}

	function _align($p, trigger, position) {
		$p.css({
			display: 'block',
			visibility: 'hidden'
		});

		var p, ac, $a = $p.find('.ui-popup-arrow').hide();
		if (position == 'center') {
			p = _center($p, $(window));
		} else {
			var $t = $(trigger);

			ac = ArrowClasses[position];
			if (ac) {
				p = _position($p, $t, position);
			} else {
				switch (position) {
				case 'top':
					p = _positions($p, $t, ['top center', 'top left', 'top right']);
					break;
				case 'bottom':
					p = _positions($p, $t, ['bottom center', 'bottom left', 'bottom right']);
					break;
				case 'left':
					p = _positions($p, $t, ['left middle', 'left bottom', 'left top']);
					break;
				case 'right':
					p = _positions($p, $t, ['right middle', 'right bottom', 'right top']);
					break;
				//case 'auto':
				default:
					p = _positions($p, $t, [
						'bottom center', 'bottom left', 'bottom right',
						'right middle', 'right bottom', 'right top',
						'top center', 'top left', 'top right',
						'right middle', 'right bottom', 'right top'
					]);
					break;
				}
				ac = ArrowClasses[p.position];
			}
		}

		$p.css({
			top: p.top,
			left: p.left,
			visibility: 'visible'
		});
		if (ac) {
			$a.attr('class', 'ui-popup-arrow ' + ac).show();
		}
	}

	function _masker() {
		return $('.ui-popup-mask');
	}
	function _active() {
		return $('.ui-popup-wrap:visible>.ui-popup-frame>.ui-popup');
	}
	function _wrapper($c) {
		return $c.parent().parent('.ui-popup-wrap');
	}
	function _data($c) {
		return $c.data('popup');
	}

	function toggle($c, trigger) {
		trigger = trigger || window;
		var $p = _wrapper($c);
		if ($p.is(':hidden')) {
			show($c, trigger);
			return;
		}

		if (_data($c).trigger === trigger) {
			hide($c);
			return;
		}

		show($c, trigger);
	}

	function hide($c) {
		var $p = _wrapper($c);
		if ($p.is(':visible')) {
			$c.trigger('hide.popup');
			$p.hide();
			$('body').removeClass('ui-popup-noscroll');
			$(document).off('.popup');
			$(window).off('.popup');
			$c.trigger('hidden.popup');
		}
		_masker().hide();
	}

	function show($c, trigger) {
		hide(_active());

		var $p = _wrapper($c), c = _data($c);

		if (c.mask) {
			_masker().show();
		}

		if (c.loaded || !c.ajax.url) {
			_show($p, $c, c, trigger);
			return;
		}

		c.showing = trigger || window;
		load($c, c);
	}

	function _bind(c) {
		$(document).off('.popup');
		if (c.mouse) {
			$(document).on('click.popup', __doc_click);
		}
		if (c.keyboard) {
			$(document).on('keydown.popup', __doc_keydown);
		}
		if (c.resize) {
			$(window).on('resize.popup', __doc_resize);
		}
	}

	function _show($p, $c, c, trigger) {
		c.trigger = trigger || window;

		$c.trigger('show.popup', c.trigger);

		if (!c.scroll) {
			$('body').addClass('ui-popup-noscroll');
		}

		$p.find('.ui-popup-closer').toggle(c.closer);

		_align($p, c.trigger, c.position);

		$p.focus().children('.ui-popup-frame').hide()[c.transition](function() {
			_bind(c);
			if (c.focus) {
				$p.find(c.focus).eq(0).focus();
			}
			$c.trigger('shown.popup', c.trigger);
		});
	}

	function __doc_click(evt) {
		if ($(evt.target).closest('.ui-popup-wrap').length) {
			return;
		}
		hide(_active());
	}

	function __doc_keydown(evt) {
		if (evt.keyCode == 27) { // Esc
			hide(_active());
		}
	}

	function __doc_resize() {
		var $c = _active(), $p = _wrapper($c), c = _data($c);
		_align($p, c.trigger, c.position);
	}

	function load($c, c) {
		var $p = _wrapper($c);

		c = $.extend(_data($c), c);

		if (c.loader) {
			$c.html('<div class="ui-popup-loader"></div>');
			_align($p, c.showing, c.position);
		}

		_load($p, $c, c);
	}

	function _load($p, $c, c) {
		var seq = ++c.sequence;

		$p.addClass('loading').find('.ui-popup-closer, .ui-popup-arrow').hide();

		$c.trigger('load.popup');

		$.ajax($.extend({}, c.ajax, {
			success: function(data, status, xhr) {
				if (seq == c.sequence) {
					c.ajaxDone.call($c, data, status, xhr);
					$c.find('[popup-dismiss="true"]').click(function() {
						hide($c);
						return false;
					});
					c.loaded = true;
					$c.trigger('loaded.popup', [ data, status, xhr ]);
				}
			},
			error: function(xhr, status, err) {
				if (seq == c.sequence) {
					c.ajaxFail.call($c, xhr, status, err);
					$c.trigger('failed.popup', [ xhr, status, err ]);
				}
			},
			complete: function() {
				if (seq == c.sequence) {
					$p.removeClass('loading');
					if (c.showing) {
						_show($p, $c, c, c.showing);
						delete c.showing;
					}
				}
			}
		}));
	}

	function _ajaxFail(xhr, status, err) {
		var $e = $('<div class="ui-popup-error">');

		if (xhr.readyState != XMLHttpRequest.DONE) {
			$e.addClass('text').text('Failed to connect to the server.')
		} else {
			var j = xhr.responseJSON, t = xhr.responseText;
			if (j) {
				var e = j.error;
				$e.addClass('text').text(typeof(e) == 'string' ? e : JSON.stringify(j, null, 4));
			} else if (t) {
				$e.html(t);
			} else {
				$e.addClass('text').text((xhr.status ? (xhr.status + ' ') : '')  + (err || status || 'error'));
			}
		}

		$(this).empty().append($e);
	}

	function _ajaxDone(data, status, xhr) {
		$(this).html(xhr.responseText);
	}

	function update($c, c) {
		if (c) {
			c = $.extend(_data($c), c);
			var $p = _wrapper($c);
			if (!$p.is(':hidden')) {
				_bind(c);
				_masker().toggle(c.mask);
			}
		}
	}

	function trigger($c, evt) {
		var a = [].slice.call(arguments, 2);
		$(_data($c).trigger).trigger(evt, a);
	}

	function destroy($c) {
		_wrapper($c).remove();
	}

	function _camelCase(s) {
		s = s.charAt(0).toLowerCase() + s.slice(1);
		return s.replace(/[-_](.)/g, function(m, g) {
			return g.toUpperCase();
		});
	}

	function _options($c) {
		var fs = ['ajax-done', 'ajax-fail'];
		var bs = ['loaded', 'autoload', 'mask', 'loader', 'closer', 'mouse', 'keyboard', 'resize', 'scroll'];

		var c = {};
		$.each($c[0].attributes, function(i, a) {
			var p = a.name.substring(0, 6),
				n = a.name.substring(6),
				v = a.value;

			if ('popup-' != p || !v) {
				return;
			}

			if ($.inArray(n, fs) >= 0) {
				c[_camelCase(n)] = new Function(v);
				return;
			}

			if ($.inArray(n, bs) >= 0) {
				v = (v === 'true');
			}

			if ('ajax-' == n.substring(0, 5)) {
				c.ajax ||= {};
				c.ajax[_camelCase(n.substring(5))] = v;
			} else {
				c[_camelCase(n)] = v;
			}
		});
		return c;
	}

	function _init($c, c) {
		if (_masker().length == 0) {
			$('<div class="ui-popup-mask">').appendTo('body');
		}

		var $p = _wrapper($c);
		if ($p.length) {
			update($c, c);
			return;
		}

		c = $.extend({ sequence: 0 }, $.popup.defaults, _options($c), c);

		var $f = $('<div class="ui-popup-frame" tabindex="0">')
			.append($('<div class="ui-popup-arrow">'))
			.append($('<i class="ui-popup-closer"></i>').hide().on('click', function() {
				hide($c);
			}));

		$p = $('<div class="ui-popup-wrap">').append($f).appendTo('body');

		if (c.cssClass) {
			$p.addClass(c.cssClass);
		}

		$c.appendTo($f).data('popup', c).addClass('ui-popup').show();

		if (c.ajax.url) {
			c.loaded = false;
			if (c.autoload) {
				_load($p, $c, c);
			}
		} else {
			c.loaded = true;
			$c.find('[popup-dismiss="true"]').click(function() {
				hide($c);
				return false;
			});
		}
	}

	var api = {
		load: load,
		show: show,
		hide: hide,
		toggle: toggle,
		update: update,
		trigger: trigger,
		destroy: destroy
	};

	$.fn.popup = function(c) {
		var args = [].slice.call(arguments);
		return this.each(function() {
			var $c = $(this);

			if (typeof (c) == 'string') {
				var p = _data($c);
				if (!p) {
					_init($c);
				}
				args[0] = $c;
				api[c].apply($c, args);
				return;
			}

			_init($c, c);
		});
	};

	$.popup = function() {
		var $c = _active();
		$c.popup.apply($c, arguments);
		return $c;
	};

	$.popup.defaults = {
		position: 'auto',
		transition: 'slideDown',
		mask: false,
		loader: false,
		closer: false,
		focus: '',
		mouse: true,
		keyboard: true,
		resize: true,
		scroll: true,
		ajax: {},
		ajaxDone: _ajaxDone,
		ajaxFail: _ajaxFail
	};

	// POPUP DATA-API
	// ==================
	$(window).on('load', function() {
		$('[data-spy="popup"]').popup();

		$('body').on('click.popup', '[popup-target]', function(evt) {
			evt.stopPropagation();
			var $t = $(this), c = _options($t);
			$($t.attr('popup-target')).popup(c).popup('toggle', this);
			return false;
		});
	});

})(jQuery);
﻿(function($) {
	"use strict";

	$(window).on('load', function() {
		$('[reload]').off('click.reload').on('click.reload', function() {
			location.reload();
			return false;
		});
	});

})(jQuery);
(function($) {
	"use strict";

	$.fn.scrollIntoView = function(speed, easing, callback) {
		if (!this.length) {
			return this;
		}

		var $e = this.first(), $w = $(window), eo = $e.offset(),
			wh = $w.height(), ww = $w.width(),
			st = $w.scrollTop(), sb = st + wh, sl = $w.scrollLeft(), sr = sl + ww,
			et = eo.top, eh = $e.outerHeight(), eb = et + eh,
			el = eo.left, ew = $e.outerWidth(), er = el + ew,
			x = sl > er ? el : (sr < el ? (ew > ww ? el : el - (ww - ew)) : -1),
			y = st > eb ? et : (sb < et ? (eh >= wh ? et : et - (wh - eh)) : -1);

		var ss = {};
		if (x >= 0) { ss.scrollLeft = x; }
		if (y >= 0) { ss.scrollTop = y; }
		$('html').animate(ss, speed, easing, callback);
		return this;
	};

})(jQuery);
(function($) {
	"use strict";

	$.fn.selectText = function() {
		var $t = $(this);
		if ($t.length) {
			var doc = document, el = $t.get(0);
			if (doc.body.createTextRange) {
				var r = doc.body.createTextRange();
				r.moveToElementText(el);
				r.select();
			} else if (window.getSelection) {
				var ws = window.getSelection(), r = doc.createRange();
				r.selectNodeContents(el);
				ws.removeAllRanges();
				ws.addRange(r);
			}
		}
	};

})(jQuery);
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
(function($) {
	"use strict";

	$.fn.textclear = function() {
		return this.each(function() {
			var $t = $(this);
			if ($t.hasClass('ui-has-textclear')) {
				return;
			}

			$t.addClass('ui-has-textclear');

			var $i = $('<i class="ui-close ui-textclear"></i>');
			$i.insertAfter($t).click(function() {
				if ($t.val() != '') {
					$t.val('').trigger('input').trigger('change');
				}
				$t.focus();
				return false;
			}).parent().css('position', 'relative');
		});
	};
	
	// ==================
	$(window).on('load', function () {
		$('[textclear]').textclear();
	});
})(jQuery);
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
(function($) {
	"use strict";

	$.fn.totop = function() {
		return this.each(function() {
			var $t = $(this), $w = $(window);

			$t.click(function() {
				$('html').animate({ scrollTop: 0 }, 'slow');
			}).css({ cursor: 'pointer' });

			$w.scroll(function() {
				$t.toggle($w.scrollTop() > $w.height());
			});
		});
	};

	$(window).on('load', function() {
		$('[totop]').totop();
	});

})(jQuery);
﻿(function($) {
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
				$t.data('droppable', true).trigger('droppable.treeview', [ dl,  $l.get(0) ]);
				if ($t.data('droppable')) {
					return [ dl, $l, $t ];
				}
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
		$n.addClass('collapsed').children('ul').slideUp();
	}

	function _expand($n) {
		$n.removeClass('collapsed').children('ul').slideDown();
	}

	function _toggle($n) {
		$n.hasClass('collapsed') ? _expand($n) : _collapse($n);
	}

	function collapse($t, $n) {
		_collapse($n || $t.find('li:not(.collapsed, .leaf)'));
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

		$t.addClass('ui-tree').find('.item').each(function() {
			var $i = $(this), $n = $i.parent();
			if ($i.next('ul').length) {
				$n.addClass('node');
			} else {
				$n.addClass('leaf');
			}
		});

		if ($t.hasClass('collapsible')) {
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
(function($) {
	"use strict";

	var isAdvancedUpload = function() {
		var div = document.createElement('div');
		return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
	}();

	var UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	function _filesize(n, p) {
		if (n === undefined || n === null) {
			return '';
		}

		var i = 0, l = UNITS.length - 1;
		while (n >= 1024 && i < l) {
			n = n / 1024
			i++
		}

		p = Math.pow(10, p || 2);
		return ' (' + Math.round(n * p) / p + UNITS[i] + ')';
	}

	function _filename(fn) {
		var u = fn.lastIndexOf('/'),
			w = fn.lastIndexOf('\\'),
			i = u > w ? u : w;
		return fn.substr(i + 1);
	}

	function _fileext(fn) {
		var e = fn.toLowerCase(), i = e.lastIndexOf('.');
		if (i >= 0) {
			e = e.substring(i+1);
		}
		return e;
	}

	function _filetype(e, t) {
		if (t) {
			var i = t.indexOf('/');
			return (i >= 0) ? t.slice(0, i) : t;
		}
		if (e) {
			e = _fileext(e);

			if ($.inArray(e, ['jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'svg', 'bmp', 'webp']) >= 0) {
				return 'image';
			}
			if ($.inArray(e, ['mp3', 'flac', 'weba', 'wav', 'mid', 'oga', 'wma']) >= 0) {
				return 'audio';
			}
			if ($.inArray(e, ['avi', 'mpg', 'mpeg', 'mp4', 'm4v', 'mov', 'webm', 'wmv']) >= 0) {
				return 'video';
			}
		}
		return 'file';
	}

	function _create_item($u, fid, fnm, fct, fsz) {
		var uc = $u.data('uploader'),
			fex = _fileext(fnm),
			fic = uc.cssIcons['.' + fex] || uc.cssIcons[fct],
			$i = $('<div>', { 'class': 'ui-uploader-item ' + fct + ' file-' + fex });

		$i.append(
			$('<input>', { type: 'hidden', name: uc.name, 'class': 'ui-uploader-fid' }).val(fid),
			$('<i>', { 'class': 'ui-close' }),
			$('<span>', { 'class': 'ui-uploader-info' }).append(
				$('<i>', { 'class': fic + ' ui-uploader-icon' }),
				$('<span>', { 'class': 'ui-uploader-text' }).text(fnm + _filesize(fsz))
			),
		);
		_update_item_dnload(uc, $i, fid, fct);

		var $e = $u.find('.ui-uploader-item:first');
		if ($e.length) {
			$i.insertBefore($e);
		} else {
			$u.append($i);
		}

		$u.find('.ui-uploader-empty').prop('disabled', true);
		return $i;
	}

	function _update_item($i, fi) {
		var $u = $i.closest('.ui-uploader'), uc = $u.data('uploader'),
			fid = fi.id || fi.path || fi.name || '',
			fnm = _filename(fi.name || fi.path || fi.id),
			fct = _filetype(fi.ext || fnm, fi.type),
			fex = _fileext(fi.ext || fnm),
			fic = uc.cssIcons['.' + fex] || uc.cssIcons[fct];

		$i.find('.ui-uploader-fid').val(fid);
		$i.find('.ui-uploader-icon').attr('class', fic + ' ui-uploader-icon');

		if (fnm) {
			$i.find('.ui-uploader-text').text(fnm + _filesize(fi.size));
		}

		_update_item_dnload(uc, $i, fid, fct);
	}

	function _update_item_dnload(uc, $i, fid, fct) {
		var durl;
		if (uc.dnloadUrl && fid) {
			durl = uc.dnloadUrl.replace(uc.dnloadHolder, uc.dnloadEncode ? encodeURIComponent(fid) : fid);
		}
		if (durl) {
			var $fif = $i.find('.ui-uploader-info');
			$('<a>', { href: durl, target: uc.dnloadTarget }).append($fif).appendTo($i);

			if (uc.preview) {
				switch (fct) {
				case 'image':
					_append_preview($i, $('<a>', { href: durl, target: uc.dnloadTarget }).append($('<img>', { src: durl })));
					break;
				case 'video':
					_append_preview($i, $('<video controls>').append($('<source>', { src: durl })));
					break;
				case 'audio':
					_append_preview($i, $('<audio controls>').append($('<source>', { src: durl })));
					break;
				}
			}
		}
	}

	function _append_preview($i, $p) {
		$('<div>').addClass('ui-uploader-preview').append($p).appendTo($i);
		$p.fadeIn();
	}

	function _append_upload($u, f, closer) {
		var fnm = _filename(f.name || f.path), fsz = f.size;

		return _create_item($u, '', fnm, 'waiting', fsz, closer).data('file', f);
	}

	function _item_on_remove() {
		$(this).closest('.ui-uploader-item').removeData('file').fadeOut(function() {
			var $i = $(this), $u = $i.closest('.ui-uploader');

			$i.remove();
			if (!$u.find('.ui-uploader-item').length) {
				$u.find('.ui-uploader-empty').prop('disabled', false);
			}
		});
		return false;
	}

	function _item_progress($i, p) {
		if (p < 100) {
			var uc = $i.closest('.ui-uploader').data('uploader');
			$i.css('background', 'linear-gradient(to right, ' + uc.pgbarFgcolor + + ' ' + p + '%, ' + uc.pgbarBgcolor + ' ' + (100 - p) + '%)');
		} else {
			$i.css('background', '').addClass('blinking');
		}
	}

	function _ajaxDone(d) {
		if (d) {
			var r = d.result || d.file;
			if (r) {
				_update_item($(this), r);
			}
		}
	}

	function _ajaxFail(xhr, status, err) {
		var $e = $('<div class="ui-uploader-error">');

		var j = xhr.responseJSON, t = xhr.responseText;
		if (j) {
			var e = j.error;
			$e.addClass('text').text(typeof(e) == 'string' ? e : JSON.stringify(j, null, 4));
		} else if (t) {
			$e.html(t);
		} else {
			$e.addClass('text').text((xhr.status ? (xhr.status + ' ') : '')  + (err || status || 'error'));
		}

		$(this).append($e);
	}

	function _init($u, uc) {
		$u.addClass('ui-uploader').data('uploader', uc).on('click', 'i.ui-close', _item_on_remove);

		var uploads = [], $uf = $u.find('.ui-uploader-file'), $ub = $u.find('.ui-uploader-btn');

		uc.name ||= $uf.attr('name');
		uc.uploadName ||= uc.name;
		$uf.attr('name', '');

		function __start_upload($i) {
			var f = $i.data('file');
			if (!f) {
				return;
			}

			$i.removeClass('waiting').addClass('loading');
			$i.find('.ui-uploader-icon').attr('class', uc.cssIcons.loading + ' ui-uploader-icon');

			$u.trigger('upload.uploader', { item: $i, file: f });

			$i.find('.ui-close').hide();

			var file = {}; file[uc.uploadName] = f;

			$.ajaf({
				url: uc.uploadUrl,
				data: uc.uploadData,
				file: file,
				dataType: 'json',
				uprogress: function(loaded, total) {
					_item_progress($i, Math.round(loaded * 100 / total));
				},
				success: function(data, status, xhr) {
					$i.css('background', '').addClass('success');
					uc.ajaxDone.call($i, data, status, xhr);
					$u.trigger('uploaded.uploader', { item: $i, data: data });
				},
				error: function(xhr, status, e) {
					$i.addClass('error');
					$i.find('.ui-uploader-icon').attr('class', uc.cssIcons['error'] + ' ui-uploader-icon');
					uc.ajaxFail.call($i, xhr, status, e);
				},
				complete: function() {
					$i.removeClass('loading blinking').removeData('file');
					if (uc.remover) {
						$i.find('.ui-close').show();
					}
					__proc_uploads();
				}
			});
		}

		function __proc_uploads() {
			while (uploads.length > 0 && $u.find('.ui-uploader-item.loading').length < uc.uploadLimit) {
				__start_upload(uploads.shift());
			}
		}

		function __append_uploads(f) {
			if (!$uf.prop('multiple')) {
				$u.find('.ui-uploader-item').remove();
			}

			var ufs = [];
			if (f instanceof FileList) {
				$.each(f, function(i, f) {
					ufs.push(_append_upload($u, f));
				});
			} else if (f instanceof File) {
				ufs.push(_append_upload($u, f));
			} else {
				$.each(f.prop('files'), function(i, f) {
					ufs.push(_append_upload($u, f));
				});
			}

			uploads = uploads.concat(ufs.reverse());
			__proc_uploads();
		}

		function __file_on_change() {
			if ($uf.val() == "") {
				return;
			}

			__append_uploads($uf);
		}

		function __file_on_drop(e) {
			e.preventDefault();

			if (!$uf.prop('disabled')) {
				var fs = e.originalEvent.dataTransfer.files;
				if (fs.length) {
					__append_uploads($uf.prop('multiple') ? fs : fs.item(0));
				}
			}
		}

		// initial values
		(uc.values || []).concat([ uc.value ]).forEach(function(v) {
			if (v) {
				_create_item($u, v, _filename(v), _filetype(v));
			}
		});

		// event handler
		$uf.change(function() {
			setTimeout(__file_on_change, 10);
		});

		$ub.click(function(e) {
			e.preventDefault();
			$uf.trigger('click');
			return false;
		});

		// drap & drop
		if (isAdvancedUpload) {
			$u.addClass('ui-uploader-draggable')
				.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
					e.preventDefault();
					e.stopPropagation();
				})
				.on('dragover dragenter', function() {
					$u.addClass('ui-uploader-dragover');
				})
				.on('dragleave dragend drop', function() {
					$u.removeClass('ui-uploader-dragover');
				})
				.on('drop', __file_on_drop);
		}
	}

	function _options($u) {
		var fs = ['ajaxDone', 'ajaxFail'];

		var c = {};
		$.each($u.data(), function(k, v) {
			if ($.inArray(k, fs) >= 0) {
				v = new Function(v);
			}
			c[k] = v;
		});
		return c;
	}

	function loading($u) {
		return $u.find('.ui-uploader-item.loading').length;
	}

	function waiting($u) {
		return $u.find('.ui-uploader-item.waiting').length;
	}

	// UPLOADER FUNCTION
	// ==================
	$.uploader = {
		defaults: {
			name: '',				// field name
			remover: true,	// show uploader remover icon
			preview: false,		// show image preview

			uploadUrl: '',			// upload URL
			uploadName: '',			// upload file field name
			uploadLimit: 1,			// max concurrent upload files

			dnloadUrl: '',			// download URL
			dnloadTarget: '_blank',	// download link target
			dnloadHolder: '$',		// download file id/name placeholder
			dnloadEncode: false,	// encode download parameter

			// fontawesome4/5/6 css
			cssIcons: {
				file: 'fa fa-file-o far fa-file',
				image: 'fa fa-file-image-o far fa-file-image',
				audio: 'fa fa-file-audio-o far fa-file-audio',
				video: 'fa fa-file-video-o far fa-file-video',
				error: 'fa fa-exclamation-circle fas fa-circle-exclamation',
				waiting: 'fa fas fa-refresh text-muted',
				loading: 'fa fas fa-refresh fa-spin'
			},

			pgbarFgcolor: '#ccc',
			pgbarBgcolor: 'transparent',

			ajaxDone: _ajaxDone,
			ajaxFail: _ajaxFail
		}
	};

	var api = {
		loading: loading,
		waiting: waiting
	};

	$.fn.uploader = function(c) {
		if (typeof c == 'string') {
			return api[c](this);
		}

		return this.each(function() {
			var $u = $(this), uc = $u.data('uploader');
			if (uc) {
				$.extend(uc, c);
				return;
			}

			uc = $.extend({}, $.uploader.defaults, _options($u), c);
			_init($u, uc);
		});
	};

	// UPLOADER DATA-API
	// ==================
	$(window).on('load', function() {
		$('[data-spy="uploader"]').uploader();
	});

})(jQuery);
(function($) {
	"use strict";

	function _onclick(evt) {
		var $pg = $(this), $li = $(evt.target).closest('li'), $a = $li.children('a');

		if ($li.hasClass('disabled')) {
			evt.preventDefault();
			return;
		}

		var pn = $a.attr('pageno'), href = $a.attr('href');
		if (pn >= 0 && href == '#') {
			evt.preventDefault();
			$pg.trigger('goto.pager', pn);
		}
	}

	function _setActivePage($p, n) {
		var $u = $p.children('ul.pagination'),
			$n = $u.children('li.page');

		$u.find('li.active').removeClass('active');

		var m = $p.data('pages'), b = n - Math.floor($n.length / 2);

		if (b + $n.length > m) {
			b = m - $n.length + 1;
		}
		if (b < 1) {
			b = 1;
		}

		var s = $p.data('style');
		if (n > 1) {
			$u.children('li.first, li.prev').removeClass('hidden disabled');
			$u.find('.ui-pager-prev>a').attr('pageno', n - 1);
		} else {
			$u.children('li.first').addClass(s.contains('F') ? 'disabled' : 'hidden');
			$u.children('li.prev').addClass(s.contains('P') ? 'disabled' : 'hidden');
		}

		$u.children('li.eleft')[b > 1 ? 'removeClass' : 'addClass']('hidden');
		$n.each(function() {
			var $li = $(this);
			$li.find('a').attr('pageno', b).text(b);
			if (b == n) {
				$li.addClass('active');
			}
			b++;
		});
		$u.children('li.eright')[b <= m ? 'removeClass' : 'addClass']('hidden');

		if (n < m) {
			$u.children('li.next, li.last').removeClass('hidden disabled');
			$u.children('li.next>a').attr('pageno', n + 1);
		} else {
			$u.children('li.next').addClass(s.contains('N') ? 'disabled' : 'hidden');
			$u.children('li.last').addClass(s.contains('L') ? 'disabled' : 'hidden');
		}
	}

	$.fn.pager = function(api, pno) {
		if (api == 'page') {
			if (pno > 0) {
				return this.each(function() { _setActivePage($(this), pno); });
			}
			return this.find('ul.pagination>li.active>a').attr('pageno');
		}
		return this.off('click.pager').on('click.pager', 'a[pageno]', _onclick);
	};

	// PAGER DATA-API
	// ==================
	$(window).on('load', function() {
		$('[data-spy="pager"]').pager();
	});
})(jQuery);
