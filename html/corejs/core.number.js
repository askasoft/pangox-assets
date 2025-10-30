(function() {
	"use strict";

	if (typeof Number.prototype.toHumanSize != "function") {
		var UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

		Number.prototype.toHumanSize = function(n, p, s) {
			var i = 0, l = UNITS.length - 1;
			while (n >= 1024 && i < l) {
				n /= 1024
				i++
			}

			p = Math.pow(10, p || 2);
			return Math.round(n * p) / p + (s || '') + UNITS[i];
		};
	}
})();

