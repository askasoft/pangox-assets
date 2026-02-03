function parseColor(color) {
	"use strict";

	function RGBColor(r, g, b) {
		var c = this;
		c.r = r;
		c.g = g;
		c.b = b;

		c.isOK = function() {
			var c = this;
			return c.r >= 0 && c.r <= 255 && c.g >= 0 && c.g <= 255 && c.b >= 0 && c.b <= 255;
		};
		c.clean = function() {
			// cleanup values
			var c = this;
			c.r = (c.r < 0 || isNaN(c.r)) ? 0 : ((c.r > 255) ? 255 : c.r);
			c.g = (c.g < 0 || isNaN(c.g)) ? 0 : ((c.g > 255) ? 255 : c.g);
			c.b = (c.b < 0 || isNaN(c.b)) ? 0 : ((c.b > 255) ? 255 : c.b);
			return c;
		};
		c.invert = function() {
			var c = this;
			c.r = 255 - c.r;
			c.g = 255 - c.g;
			c.b = 255 - c.b;
			return c;
		};
		c.toRGB = function () {
			var c = this;
			return 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
		};
		c.toHex = function () {
			var c = this, r = c.r.toString(16), g = this.g.toString(16), b = this.b.toString(16);
			if (r.length == 1) r = '0' + r;
			if (g.length == 1) g = '0' + g;
			if (b.length == 1) b = '0' + b;
			return '#' + r + g + b;
		};
	}

	color = color.replace(/ /g, '').toLowerCase();

	// array of color definition objects
	var parsers = [{
		regexp: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
		create: function (ms) {
			return new RGBColor(parseInt(ms[1]), parseInt(ms[2]), parseInt(ms[3]));
		}
	}, {
		regexp: /^#(\w{2})(\w{2})(\w{2})$/,
		create: function (ms) {
			return new RGBColor(parseInt(ms[1], 16), parseInt(ms[2], 16), parseInt(ms[3], 16));
		}
	}, {
		regexp: /^#(\w{1})(\w{1})(\w{1})$/,
		create: function (ms) {
			return new RGBColor(parseInt(ms[1] + ms[1], 16), parseInt(ms[2] + ms[2], 16), parseInt(ms[3] + ms[3], 16));
		}
	}];

	// search through the definitions to find a match
	for (var i = 0; i < parsers.length; i++) {
		var p = parsers[i];
		var ms = p.regexp.exec(color);
		if (ms) {
			return p.create(ms).clean();
		}
	}
	return new RGBColor(-1, -1, -1);
}
