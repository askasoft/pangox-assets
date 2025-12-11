/**
 * jQuery jsonview
 * based on https://github.com/abodelot/jquery.json-viewer (Alexandre Bodelot <alexandre.bodelot@gmail.com>)
 * Modified by Frank Wang
 */
(function($) {
	"use strict";

	/**
	 * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
	 * @return boolean
	 */
	function isCollapsible(arg) {
		return arg instanceof Object && Object.keys(arg).length > 0;
	}

	/**
	 * Check if a string looks like a URL, based on protocol
	 * This doesn't attempt to validate URLs, there's no use and syntax can be too complex
	 * @return boolean
	 */
	function isUrl(s) {
		for (var i = 0; i < protocols.length; ++i) {
			if (s.startsWith(protocols[i])) {
				return true;
			}
		}
		return false;
	}
	var protocols = ['http://', 'https://', 'ftp://', 'ftps://'];

	/**
	 * Return the input string html escaped
	 * @return string
	 */
	function htmlEscape(s) {
		return s.replace(/[&'`"<>]/g, function(c) {
			return escapes[c];
		});
	}
	var escapes = {
		'&': '&amp;',
		"'": '&apos;',
		'`': '&#x60;',
		'"': '&quot;',
		'<': '&lt;',
		'>': '&gt;'
	};

	/**
	 * Transform a json object into html representation
	 * @return string
	 */
	function json2html(json, options) {
		var html = '';
		if (typeof json === 'string') {
			// Escape tags and quotes
			json = htmlEscape(json);

			if (options.withLinks && isUrl(json)) {
				html += '"<a href="' + json + '" class="json-string" target="_blank">' + json + '</a>"';
			} else {
				// Escape double quotes in the rendered non-URL string.
				json = json.replace(/&quot;/g, '\\&quot;');
				html += '"<span class="json-string">' + json + '</span>"';
			}
		} else if (typeof json === 'number' || typeof json === 'bigint') {
			html += '<span class="json-literal">' + json + '</span>';
		} else if (typeof json === 'boolean') {
			html += '<span class="json-literal">' + json + '</span>';
		} else if (json === null) {
			html += '<span class="json-literal">null</span>';
		} else if (json instanceof Array) {
			if (json.length > 0) {
				html += '[<ol class="json-array">';
				for (var i = 0; i < json.length; ++i) {
					html += '<li>';
					// Add toggle button if item is collapsible
					if (isCollapsible(json[i])) {
						html += '<a href class="json-toggle"></a>';
					}
					html += json2html(json[i], options);
					// Add comma if item is not last
					if (i < json.length - 1) {
						html += ',';
					}
					html += '</li>';
				}
				html += '</ol>]';
			} else {
				html += '[]';
			}
		} else if (typeof json === 'object') {
			// Optional support different libraries for big numbers
			// json.isLosslessNumber: package lossless-json
			// json.toExponential(): packages bignumber.js, big.js, decimal.js, decimal.js-light, others?
			if (options.bigNumbers && (typeof json.toExponential === 'function' || json.isLosslessNumber)) {
				html += '<span class="json-literal">' + json.toString() + '</span>';
			} else {
				var keyCount = Object.keys(json).length;
				if (keyCount > 0) {
					html += '{<ul class="json-dict">';
					for (var key in json) {
						if (Object.prototype.hasOwnProperty.call(json, key)) {
							// define a parameter of the json value first to prevent get null from key when the key changed by the function `htmlEscape(key)`
							let jsonElement = json[key];
							key = htmlEscape(key);
							var keyRepr = options.withQuotes ?
								'"<span class="json-string">' + key + '</span>"' : key;

							html += '<li>';
							// Add toggle button if item is collapsible
							if (isCollapsible(jsonElement)) {
								html += '<a href class="json-toggle">' + keyRepr + '</a>';
							} else {
								html += keyRepr;
							}
							html += ': ' + json2html(jsonElement, options);
							// Add comma if item is not last
							if (--keyCount > 0) {
								html += ',';
							}
							html += '</li>';
						}
					}
					html += '</ul>}';
				} else {
					html += '{}';
				}
			}
		}
		return html;
	}

	/**
	 * jQuery plugin method
	 * @param json: a javascript object
	 * @param options: an optional options hash
	 */
	$.fn.jsonview = function(json, options) {
		// Merge user options with default options
		options = Object.assign({}, {
			collapsed: false,
			rootCollapsible: true,
			withQuotes: false,
			withLinks: true,
			bigNumbers: false
		}, options);

		// jQuery chaining
		return this.each(function() {
			var $t = $(this), data = json;

			if (!data) {
				// parse the inner html to json
				try {
					data = JSON.parse($t.text());
				} catch (e) {
				}
			}

			// Transform to HTML
			var html = json2html(data, options);
			if (options.rootCollapsible && isCollapsible(data)) {
				html = '<a href class="json-toggle"></a>' + html;
			}

			// Insert HTML in target DOM element
			$t.html(html);
			$t.addClass('json-document');

			// Bind click on toggle buttons
			$t.off('click');
			$t.on('click', 'a.json-toggle', function() {
				var $a = $(this).toggleClass('collapsed'), $t = $a.siblings('ul.json-dict, ol.json-array');
				if ($a.hasClass('collapsed')) {
					$t.slideUp(function() {
						var count = $t.children('li').length;
						var placeholder = count + (count > 1 ? ' items' : ' item');
						$t.after('<a href class="json-placeholder">' + placeholder + '</a>');
					});
				} else {
					$t.siblings('.json-placeholder').remove();
					$t.slideDown();
				}
				return false;
			});

			// Simulate click on toggle button when placeholder is clicked
			$t.on('click', 'a.json-placeholder', function() {
				$(this).siblings('a.json-toggle').click();
				return false;
			});

			if (options.collapsed == true) {
				// Trigger click to collapse all nodes
				$t.find('a.json-toggle').click();
			}
		});
	};

	// JSONVIEW DATA-API
	// ==================
	$(window).on('load', function() {
		$('[data-spy="jsonview"]').jsonview();
	});
})(jQuery);
