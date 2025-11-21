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
