(function() {
	"use strict";

	if (typeof String.prototype.hashCode != "function") {
		String.prototype.hashCode = function() {
			var s = this, h = 0;
			for (var i = 0; i < s.length; i++) {
				// h = 31 * h + s.charCodeAt(i);
				h = ((h << 5) - h) + s.charCodeAt(i); // faster
				h |= 0; // Convert to 32bit integer
			}
			return h;
		};
	}

	if (typeof String.prototype.stripStart != "function") {
		var re = /^[\s\u0085\u00a0\u2000\u3000]+/;
		String.prototype.stripStart = function() {
			return this.replace(re, "");
		};
	}
	if (typeof String.prototype.stripEnd != "function") {
		var re = /[\s\u0085\u00a0\u2000\u3000]+$/;
		String.prototype.stripEnd = function() {
			return this.replace(re, "");
		};
	}
	if (typeof String.prototype.strip != "function") {
		var re = /^[\s\u0085\u00a0\u2000\u3000]+|[\s\u0085\u00a0\u2000\u3000]+$/g;
		String.prototype.strip = function() {
			return this.replace(re, "");
		};
	}

	if (typeof String.prototype.fields != "function") {
		var ws = /[\s\u0085\u00a0\u2000\u3000]/g;
		String.prototype.fields = function(re) {
			re ||= ws;

			var ss = this.split(re), rs = [];
			for (var i = 0; i < ss.length; i++) {
				if (ss[i].length) {
					rs.push(ss[i])
				}
			}
			return rs;
		};
	}

	if (typeof String.prototype.padCenter != "function") {
		String.prototype.padCenter = function(n, c) {
			c = c || ' ';
			var s = this, z = s.length, p = n - z;
			if (p <= 0) {
				return s;
			}
			s = s.padStart(z+p/2, c);
			s = s.padEnd(n, c);
			return s;
		};
	}

	if (typeof String.prototype.capitalize != "function") {
		String.prototype.capitalize = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		};
	}
	if (typeof String.prototype.uncapitalize != "function") {
		String.prototype.uncapitalize = function() {
			return this.charAt(0).toLowerCase() + this.slice(1);
		};
	}

	if (typeof String.prototype.snakeCase != "function") {
		String.prototype.snakeCase = function(d) {
			d ||= '_';

			var s = this, uc = 0, lc = '', n = '';
			for (var i = 0; i < s.length; i++) {
				var x = s.charCodeAt(i), c = s.charAt(i);
				if (x >= 0x41 && x <= 0x5A) {
					if (i > 0 && uc == 0 && lc != d) {
						n += d
					}

					uc++;
					lc = c.toLowerCase()
					n += lc;
					continue
				}

				if (uc > 1 && d != c) {
					n += d;
				}
				n += c;
				uc = 0;
				lc = c;
			}
			return n;
		};
	}
	if (typeof String.prototype.camelCase != "function") {
		String.prototype.camelCase = function() {
			var s = this.charAt(0).toLowerCase() + this.slice(1);
			return s.replace(/[-_](.)/g, function(m, g) {
				return g.toUpperCase();
			});
		};
	}
	if (typeof String.prototype.pascalCase != "function") {
		String.prototype.pascalCase = function(c) {
			return this.camelCase().capitalize();
		};
	}

	if (typeof String.prototype.format != "function") {
		String.prototype.format = function() {
			var args = arguments;
			return this.replace(/\{(\d+)\}/g, function(m, i) {
				return args[i];
			});
		};
	}

	if (typeof String.prototype.substr != 'function') {
		String.prototype.substr = function(i, l) {
			return this.slice(i, l >= 0 ? i+l : undefined);
		};
	}
	if (typeof String.prototype.substrAfter != 'function') {
		String.prototype.substrAfter = function(c) {
			var s = this, i = s.indexOf(c);
			return (i >= 0) ? s.slice(i + c.length) : "";
		};
	}
	if (typeof String.prototype.substrAfterLast != 'function') {
		String.prototype.substrAfterLast = function(c) {
			var s = this, i = s.lastIndexOf(c);
			return (i >= 0) ? s.slice(i + c.length) : "";
		};
	}
	if (typeof String.prototype.substrBefore != 'function') {
		String.prototype.substrBefore = function(c) {
			var s = this, i = s.indexOf(c);
			return (i >= 0) ? s.slice(0, i) : s;
		};
	}
	if (typeof String.prototype.substrBeforeLast != 'function') {
		String.prototype.substrBeforeLast = function(c) {
			var s = this, i = s.lastIndexOf(c);
			return (i >= 0) ? s.slice(0, i) : s;
		};
	}

	/**
	 * Truncate a string and add an ellipsiz ('...') to the end if it exceeds the specified length.
	 */
	if (typeof String.prototype.ellipsis != 'function') {
		String.prototype.ellipsis = function(n, x) {
			var s = this, x = x || '...';;
			return s.length > n ? s.slice(0, n) + x : s;
		};
	}
	/**
	 * Truncate a string and add an ellipsiz ('…') to the end if it exceeds the specified length.
	 * the length of charCodeAt(i) > 0xFF will be treated as 2. 
	 */
	if (typeof String.prototype.ellipsiz != 'function') {
		String.prototype.ellipsiz = function(n, x) {
			var s = this, z = 0, x = x || '…';
			for (var i = 0; i < s.length; i++) {
				z += (s.charCodeAt(i) > 0xFF ? 2 : 1);
				if (z > n) {
					return s.slice(0, i) + x;
				}
			}
			return s;
		}
	}

	if (typeof String.prototype.escapeRegExp != "function") {
		String.prototype.escapeRegExp = function() {
			return this.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
		};
	}
	if (typeof String.prototype.escapeHTML != "function") {
		var ehm = {
			'&': '&amp;',
			"'": '&apos;',
			'`': '&#x60;',
			'"': '&quot;',
			'<': '&lt;',
			'>': '&gt;'
		};

		String.prototype.escapeHTML = function() {
			return this.replace(/[&'`"<>]/g, function(c) {
				return ehm[c];
			});
		};
	}

	if (typeof String.prototype.encodeUTF8 != "function") {
		String.prototype.encodeUTF8 = function() {
			var s = this, utf8 = "";
			for (var n = 0; n < s.length; n++) {
				var c = s.charCodeAt(n);

				if (c < 128) {
					utf8 += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					utf8 += String.fromCharCode((c >> 6) | 192);
					utf8 += String.fromCharCode((c & 63) | 128);
				} else {
					utf8 += String.fromCharCode((c >> 12) | 224);
					utf8 += String.fromCharCode(((c >> 6) & 63) | 128);
					utf8 += String.fromCharCode((c & 63) | 128);
				}
			}

			return utf8;
		};
	}
	if (typeof String.prototype.decodeUTF8 != "function") {
		String.prototype.decodeUTF8 = function() {
			var s = this, o = "", i = 0, c = 0, c2 = 0, c3 = 0;
			while (i < s.length) {
				c = s.charCodeAt(i);

				if (c < 128) {
					o += String.fromCharCode(c);
					i++;
				} else if (c > 191 && c < 224) {
					c2 = s.charCodeAt(i + 1);
					o += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = s.charCodeAt(i + 1);
					c3 = s.charCodeAt(i + 2);
					o += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return o;
		};
	}

	if (typeof String.prototype.encodeBase64 != "function") {
		String.prototype.encodeBase64 = function() {
			return btoa(this.encodeUTF8());
		};
	}
	if (typeof String.prototype.decodeBase64 != "function") {
		String.prototype.decodeBase64 = function() {
			return atob(this).decodeUTF8();
		};
	}
})();
