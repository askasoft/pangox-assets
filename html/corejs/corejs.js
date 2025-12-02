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
(function() {
	"use strict";

	if (typeof Function.prototype.bind != "function") {
		/**
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
		 * 
		 * Syntax:
		 * <pre><code>
			fun.bind(thisArg[, arg1[, arg2[, ...]]])
			</code></pre>
		 * @return {Function} The new function
		 */
		Function.prototype.bind = function(scope/*, args...*/) {
			// make args available, in function below
			var fn = this, args = [].slice.call(arguments, 1);
			return function() {
				return fn.apply(scope, args);
			};
		};
	}

	if (typeof Function.prototype.callback != "function") {
		/**
		 * Creates a callback that passes arguments[0], arguments[1], arguments[2], ...
		 * Call directly on any function. Example: <code>myFunction.callback(arg1, arg2)</code>
		 * Will create a function that is bound to those 2 args. <b>If a specific scope is required in the
		 * callback, use {@link #delegate} instead.</b> The function returned by callback always
		 * executes in the caller scope.
		 * <p>This method is required when you want to pass arguments to a callback function.  If no arguments
		 * are needed, you can simply pass a reference to the function as a callback (e.g., callback: myFn).
		 * However, if you tried to pass a function with arguments (e.g., callback: myFn(arg1, arg2)) the function
		 * would simply execute immediately when the code is parsed. Example usage:
		 * <pre><code>
			var sayHi = function(hi, name) {
				alert(hi + ', ' + name);
			}
			
			$.ajax({
				url: '/sayhi',
				success: sayHi.callback('hi')
			});
			</code></pre>
		 * @return {Function} The new function
		 */
		Function.prototype.callback = function(/*args...*/) {
			// make args available, in function below
			var fn = this, args = [].slice.call(arguments, 0);
			return function() {
				return fn.apply(this, args.concat([].slice.call(arguments, 0)));
			};
		};
	}

	if (typeof Function.prototype.delegate != "function") {
		/**
		 * Creates a delegate (callback) that sets the scope to arguments[0].
		 * Call directly on any function. Example: <code>this.myFunction.delegate(this, [ arg1, arg2 ])</code>
		 * Will create a function that is automatically scoped to scope so that the <tt>this</tt> variable inside the
		 * callback points to scope. Example usage:
		 * <pre><code>
			var sayHi = function(name, event) {
				// Note this use of "this.text()" here.
				// This function expects to execute within a scope that contains a text() method.
				// In this example, the "this" variable is pointing to the btn object that was passed in delegate below.
				alert('Hi, ' + name + '. You clicked the "' + this.text() + '" button.');
			}
	
			var btn = $('<button>').text('Say Hi');
	
			// This callback will execute in the scope of the
			// button instance. Clicking the button alerts
			// "Hi, Fred. You clicked the "Say Hi" button."
			btn.on('click', sayHi.delegate(btn, [ 'Fred' ]));
			</code></pre>
		 * @param {Object} scope (optional) The object for which the scope is set
		 * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
		 * @param {Boolean} append (optional) if True args are appended to the call arguments instead of prepending
		 * @return {Function} The new function
		 */
		Function.prototype.delegate = function(scope, args, append) {
			var fn = this;
			return function() {
				var g = [].slice.call(arguments, 0);
				args ||= [];
				args = append ? g.concat(args) : args.concat(g);
				return fn.apply(scope || this, args);
			};
		};
	}

	if (typeof Function.prototype.delay != "function") {
		/**
		 * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
		 * <pre><code>
			var sayHi = function(name) {
				alert('Hi, ' + name);
			}
	
			// executes immediately:
			sayHi('Fred');
	
			// executes after 2 seconds:
			sayHi.delay(2000, this, 'Fred');
	
			</code></pre>
		 * @param {Number} millis The number of milliseconds for the setTimeout call (if 0 the function is executed immediately)
		 * @param {Object} scope (optional) The object for which the scope is set
		 * @param {...} args (optional) Arguments for the call.
		 * @return {Number} The timeout id that can be used with clearTimeout
		 */
		Function.prototype.delay = function(millis/*, scope, args...*/) {
			var fn = this.bind.apply([].slice.call(arguments, 1));
			if (millis) {
				return setTimeout(fn, millis);
			}
			fn();
			return 0;
		};
	}

	if (typeof Function.prototype.precall != "function") {
		/**
		 * Creates an interceptor function. The passed fcn is called before the original one. If it returns false,
		 * the original one is not called. The resulting function returns the results of the original function.
		 * The passed fcn is called with the parameters of the original function. Example usage:
		 * <pre><code>
			var sayHi = function(name) {
				alert('Hi, ' + name);
			}
	
			sayHi('Fred'); // alerts "Hi, Fred"
	
			// create a new function that validates input without
			// directly modifying the original function:
			var sayHiToFriend = sayHi.precall(function(name) {
				return name == 'Brian';
			});
	
			sayHiToFriend('Fred');	// no alert
			sayHiToFriend('Brian'); // alerts "Hi, Brian"
			</code></pre>
		 * @param {Function} pref The function to call before the original
		 * @param {Object} scope (optional) The scope of the passed fcn (Defaults to scope of original function or window)
		 * @return {Function} The new function
		 */
		Function.prototype.precall = function(pref, scope) {
			if (typeof pref != "function") {
				return this;
			}

			var fn = this;
			return function() {
				if (pref.apply(scope || this, arguments) === false) {
					return;
				}
				return fn.apply(this, arguments);
			};
		};
	}

	if (typeof Function.prototype.postcall != "function") {
		/**
		 * Create a combined function call sequence of the original function + the passed function.
		 * The resulting function returns the results of the original function.
		 * The passed fcn is called with the parameters of the original function. Example usage:
		 * <pre><code>
			var sayHi = function(name) {
				alert('Hi, ' + name);
			}
	
			sayHi('Fred'); // alerts "Hi, Fred"
	
			var sayGoodbye = sayHi.postcall(function(name) {
				alert('Bye, ' + name);
			});
	
			sayGoodbye('Fred'); // both alerts show
			</code></pre>
		 * @param {Function} postf The function to sequence
		 * @param {Object} scope (optional) The scope of the passed fcn (Defaults to scope of original function or window)
		 * @return {Function} The new function
		 */
		Function.prototype.postcall = function(postf, scope) {
			if (typeof postf != "function") {
				return this;
			}

			var fn = this;
			return function() {
				var rv = fn.apply(this, arguments);
				postf.apply(scope || this, arguments);
				return rv;
			};
		};
	}
})();

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
