(function() {
	"use strict";

	if (typeof Array.prototype.clear != 'function') {
		Array.prototype.clear = function() {
			var a = this;
			a.splice(0, a.length);
			return a;
		};
	}

	if (typeof Array.prototype.remove != 'function') {
		// Remove each element o that satisfied fn(o) === true in array
		Array.prototype.remove = function(fn, scope) {
			var a = this;
			for (var i = a.length - 1; i >= 0; i--) {
				if (fn.call(scope, a[i], i, a)) {
					a.splice(i, 1);
				}
			}
			return a;
		};
	}
})();
