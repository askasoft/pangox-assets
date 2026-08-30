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
