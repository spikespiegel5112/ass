/**
 * Created by xingweiwei on 15/6/19.
 */
(function($, window) {

	'use strict'

	//默认隐藏标题，自动处理成 XXX...
	//全文自动设置为 title属性
	$.fn.extend({
		
		popup: function(options) {
			options = $.extend({
				closebtn: '',
				maskopacity: 0,
				noborder: false,
				noalign: false
			}, options);
			var $this = $(this),
				thisParent = $this.parent(),
				popupWrapperEl = $('<div></div>').addClass('commonPopupWrapper'),
				popupContainerEl = $('<div></div>').addClass('commonPopupContainer'),
				contentWidth = $this.width();
			$('body').append(popupContainerEl.append(popupWrapperEl));
			popupWrapperEl.css({
				width: contentWidth,
				border: '10px solid rgba(153,153,153,0.5)',
				'border-radius': 10
			});
			popupContainerEl.css({
				display: 'block',
				position: 'fixed',
				top: 0,
				left: 0,
				'z-index': 99999,
				width: $(window).width(),
				height: $(window).height(),
				background: 'rgba(0,0,0,' + options.maskopacity + ')'
			});
			popupContainerEl.resize(function() {
				popupContainerEl.css({
					width: $(window).width(),
					height: $(window).height(),
				});
			});
			popupWrapperEl.append($this);
			$this.css({
				display: 'block'
			});
			popupWrapperEl.css({
				display: 'block',
				opacity: 1
			});
			if (popupWrapperEl.height() > $(window).height() - 20) {
				popupWrapperEl.css({
					width: ($this.outerWidth() + 15),
					height: ($(window).height() - 100),
					overflow: 'auto'
				});

			};
			if (!options.noalign) {
				popupWrapperEl.align();
			}
			if (options.closebtn != '') {
				$(options.closebtn).each(function() {
					$(this).one('click', function() {
						popupContainerEl.detach();
						thisParent.append($this.hide());
					});
				});
			};
		},
		
		align: function(options) {
			options = $.extend({
				position: 'both',
				container: '',
				isImage: false,
				offsetx: 0,
				offsety: 0,
				ignore: ''
			}, options);

			var that = this,
				imgSrc = that.attr('src'),
				reload = false,
				container = $(options.container),
				thisWidth = 0,
				thisHeight = 0,
				containerheight = 0,
				timer,
				offsety=0,
				ignorex=0,
				ignorey=0,
				ignoreArr=[],
				windowWidth = $(window).width(),
				windowHeight = $(window).height();
			//_this.attr('src', imgSrc + '?' + Date.parse(new Date()))

			initAligning();
			$(window).resize(function() {
				initAligning();
			});

			function initAligning() {
				if (typeof options.ignore === 'string') {
					ignoreArr=options.ignore.split(',');
					for(var i=0;i<ignoreArr.length;i++){
						ignorex+=$(ignoreArr[i]).width();
						ignorey+=$(ignoreArr[i]).height();
					}
				}
				//当居中元素是img标签时，特殊处理！
				if (that.is('img')) {
					//递归判断需要居中的图片是否加载完成，如果没有就重载
					var checkImageLoaded = function() {
						that.each(function(index) {
							var $this = $(this);
							if ($this.height() == 0) {
								console.log('load failed ' + $(this).width())
								reload = true;
								return false;
							} else {
								containerheight = container.eq(index).height();
								checkPosition($this, containerheight)
								console.log('第' + index + '张图片的高度:' + containerheight)
							}
						});
						if (reload) {
							reload = false;
							checkBrowser({
								ie: function() {
									timer = window.setTimeout(function() {
										checkImageLoaded();
									}, 100);
								},
								other: function() {
									timer = setTimeout(function() {
										checkImageLoaded();
									}, 100);
								}
							})
						}
					}
					checkImageLoaded();
					//缺省情况
				} else {
					//需要遍历每个居中对象，判断其每个container尺寸不同时，需分别处理
					//container设置判断
					if (options.container != '') {
						that.each(function(index) {
							containerheight = container.eq(index).height();
							windowWidth = container.width();
							checkPosition($(this));
						})
					} else {
						that.each(function(index) {
							var $this = $(this);
							if ($this.is(':hidden')) {
								return true
							} else {
								checkPosition($this);
								$(window).resize(function() {
									checkPosition($this);
								})
							}

						})
					}
				}
			}

			function checkPosition(_this) {
				// console.log('begin aligning')
				checkBrowser({
					ie: function() {
						window.clearTimeout(timer);
					},
					other: function() {
						clearTimeout(timer);
					}
				})

				thisWidth = _this.outerWidth(),
					thisHeight = _this.outerHeight();

				switch (options.position) {
					case 'both':
						aligning(function(thisWidth, thisHeight) {
							if (options.container != '') {
								var marginY = (containerheight - thisHeight) / 2;
							} else {
								var marginY = ($(window).height() - thisHeight) / 2;
							}
							if (marginY <= 0) {
								marginY = 0;
							};
							if (thisWidth <= $(window).width()) {
								_this.css({
									'margin': marginY + offsety - ignorey + 'px auto'
								});
								if (options.offsetX != 0) {
									//alert((windowWidth - thisWidth) / 2 + options.offsetX)
									_this.css({
										'margin': marginY + offsety - ignorey + 'px ' + (windowWidth - thisWidth) / 2 + 'px'
									});
								};
							} else {
								_this.css({
									'margin': marginY + offsety - ignorey + 'px ' + (windowWidth - thisWidth) / 2 + options.offsetX + 'px'
								});
							}
						});
						break;
					case 'top':
						aligning(function(thisWidth, thisHeight) {
							if ($(document).height() > $(window).height()) {
								return;
							} else {
								_this.css({
									'margin': (windowWidth - thisWidth) / 2 + ' auto'
								});
							}
						});
						break;
					case 'right':
						aligning(function(thisWidth, thisHeight) {
							_this.css({
								'margin': (windowHeight - thisHeight) / 2 + 'px 0 0 ' + (windowWidth - thisWidth) + 'px'
							});
						});
						break;
					case 'bottom':
						aligning(function(thisWidth, thisHeight) {
							_this.css({
								'margin': (windowHeight - thisHeight + offsety - ignorey ) + 'px auto 0'
							});
						});
						break;
					case 'left':
						aligning(function(thisWidth, thisHeight) {
							_this.css({
								'margin': (windowHeight - thisHeight) / 2 + 'px 0 0 0'
							});
						});
						break;
				}
			}

			function aligning(callback) {
				$(window).resize(function() {
					thisWidth = that.outerWidth();
					thisHeight = that.outerHeight();
					return callback(thisWidth, thisHeight)
				});
				return callback(thisWidth, thisHeight);
			}

			function checkBrowser(callback) {
				callback = $.extend({
					ie: function() {
						return;
					},
					other: function() {
						return;
					}
				}, callback)
				if (navigator.appName.indexOf("Explorer") > -1) {
					console.log('IE')
					callback.ie();
				} else {
					// console.log('other')
					callback.other();
				}
			}
			//屏幕方向探测器
			function orientationSensor(callback) {
				var windowWidth = $(window).width(),
					windowHeight = $(window).height(),
					orientation = '';
				callback = $.extend({
					portrait: function() {},
					landscape: function() {},
					orientationchange: function(windowWidth, windowHeight) {}
				}, callback)

				checkoritation();
				$(window).resize(function() {
					checkoritation();
				});

				function checkoritation() {
					callback.orientationchange();
					if (windowWidth < windowHeight) {
						return callback.portrait();
					} else {
						return callback.landscape();
					}
				}
				return (windowWidth < windowHeight) ? orientation = 'portrait' : orientation = 'landscape';
			}
		},
		//滑块拖动控件
		sliderControl: function(options, callback) {
			var config = $.extend({
				density: 100,
				offset: 0,
				axisx: '',
				progress: '',
				returnto: false
			}, options);

			var _this = $(this),
				isMousedown = false,
				offsetLeft = _this.offset().left,
				startX = 0,
				startY = 0,
				axisWidth = $(config.axisx).width(),
				sliderWidth = _this.width(),
				unitWidth = axisWidth / config.density,
				index = 0,
				progress = 0,
				returned = false,
				offsetVal = [],
				container = _this.parent();
			var touchStart, touchMove, touchEnd;
			touchStart = isMobile() ? 'touchstart' : 'mousedown';
			touchMove = isMobile() ? 'touchmove' : 'mousemove';
			touchEnd = isMobile() ? 'touchend' : 'mouseup';

			config.density += 1;

			if (typeof config.offset == 'string') {
				$(config.offset).each(function(i) {
					offsetVal[i] = Number($(this).val());
				});
			} else if (typeof config.offset == 'number') {
				_this.each(function(i) {
					offsetVal[i] = config.offset;
					$(config.returnto).val(offsetVal[i]);
					
				});
			}
			_this.each(function(i) {
				//_this.css('margin-left', -sliderWidth / 2);
				_this.eq(i).on(touchStart, function(e) {
					isMousedown = true;
					if (isMobile()) {
						var touch = e.originalEvent.touches[0];
					} else {
						var touch = e;
					}
					var startX = touch.clientX,
						startY = touch.clientY;
					index = i;
				});
				container.on(touchMove, function(e) {
					if (isMousedown) {
						
						if (isMobile()) {
							var touch = e.originalEvent.touches[0];
						} else {
							var touch = e;
						}
						var moveX = touch.pageX - offsetLeft;
						//在滑动滑块的时候阻止默认事件
						if (moveX - startX != 0) {
							e.preventDefault();
						}
						if (touch.clientX < offsetLeft + axisWidth && touch.clientX > offsetLeft) {
							if (returned) {
								_this.eq(index).css('margin-left', moveX - sliderWidth / 2);
								returned = false;
							}
						}
						if (!returned) {
							progress = progress * (config.density / axisWidth) + offsetVal[index];
							if (progress >= config.density + offsetVal[index]) {
								progress = config.density + offsetVal[index] - 1;
							};
							if ($(config.returnto).eq(index).is('input')) {
								$(config.returnto).eq(index).val(Math.floor(progress));
							} else {
								$(config.returnto).eq(index).html(Math.floor(progress));
							}
							returned = true;
						};
						if (moveX < 0) {
							progress = 0;
						} else if (moveX >= axisWidth) {
							progress = axisWidth;
						} else {
							progress = moveX + 1;
						}
						if (typeof options == 'string') {
							switch (options) {
								case 'onmove':
									callback();
									break;
							}
							return;
						}
					}
				});
			});

			$(config.returnto).each(function(i) {
				var $this = $(this),
					initVal = Number($this.val());
				if ($this.is('input')) {
					var isFirefox = 0;
					if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
						$this.attr('autocomplete', 'off')
					}
					$this.keyup(function() {
						var value = Number($(this).val());
						if (value > config.density + initVal) {
							value = config.density + initVal;
						} else if (value < 0 || value < initVal) {
							value = initVal;
						} else if (isNaN(value)) {
							value = config.density + initVal;
						}
						$(this).val(value);
						_this.eq(i).css('margin-left', (value - offsetVal[i]) * (axisWidth / config.density));
					});
				} else {
					var value = Number($(this).val());
					$(this).html(value);
				}
			});

			$(document).on(touchEnd, function() {
				isMousedown = false;
			});

			function isMobile() {
				var sUserAgent = navigator.userAgent.toLowerCase(),
					bIsIpad = sUserAgent.match(/ipad/i) == "ipad",
					bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os",
					bIsMidp = sUserAgent.match(/midp/i) == "midp",
					bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
					bIsUc = sUserAgent.match(/ucweb/i) == "ucweb",
					bIsAndroid = sUserAgent.match(/android/i) == "android",
					bIsCE = sUserAgent.match(/windows ce/i) == "windows ce",
					bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile",
					bIsWebview = sUserAgent.match(/webview/i) == "webview";
				return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
			}
		}
	});

	$.extend({
		orientationSensor: function(callback) {
			var windowWidth = $(window).width(),
				windowHeight = $(window).height(),
				orientation = '';
			callback = $.extend({
				portrait: function() {},
				landscape: function() {},
				orientationchange: function(windowWidth, windowHeight) {

				}
			}, callback);

			checkoritation();
			$(window).resize(function() {
				checkoritation();
			});

			function checkoritation() {
				callback.orientationchange();
				if (windowWidth < windowHeight) {
					return callback.portrait();
				} else {
					return callback.landscape();
				}
			}
			return (windowWidth < windowHeight) ? orientation = 'portrait' : orientation = 'landscape';
		},
		remResizing: function(options) {
			options = $.extend({
				fontsize: 16,
				baseline: 320,
				threshold: 0,
				basedonnarrow: false,
				basedonwide: false,
				dropoff: false,
				aligncenter: false,
				inward: false
			}, options);
			var htmlEl = $('html'),
				bodyEl = $('body'),
				frontline = $(window).width(),
				windowHeight = $(window).height();

			if (options.baseline <= 0) {
				options.baseline = 1;
			};
			sizeConstraint();
			$(window).on('resize', function() {
				sizeConstraint();
			});

			function sizeConstraint() {
				if (options.basedonnarrow) {
					orientationSensor({
						portrait: function() {
							frontline = $(window).width(),
								windowHeight = $(window).height();
						},
						landscape: function() {
							frontline = $(window).height(),
								windowHeight = $(window).width();
						}
					});
				} else {
					frontline = $(window).width(),
						windowHeight = $(window).height();
				}

				var factor = 0;
				if (options.baseline == 0) {
					//alert('当最小宽度等于0时')
					factor = 1;
				} else if (frontline <= options.baseline) {
					//alert('当最小宽度不等于0且屏幕宽度小于等于最小宽度时')
					if (options.inward) {
						factor = frontline/ options.threshold;
					}else{
						factor = frontline / options.baseline;
					}
				} else if (frontline > options.baseline && frontline <= options.threshold || options.threshold == 0) {
					//alert('当屏幕宽度大于最小宽度且小于等于最大宽度，或没有最大宽度时')
					if (options.threshold >= 0) {
						if (options.inward) {
							factor = frontline/ options.threshold;
						}else{
							factor = frontline / options.baseline;
						}
					}
					console.log(frontline)
				} else if (frontline > options.threshold) {
					//alert('当屏幕宽度大于最大宽度时')
					factor = frontline / options.threshold;

					if (options.aligncenter) {
						bodyEl.css({
							margin: '0 auto',
							width: options.threshold
						});
					} else {
						bodyEl.css('margin', 0);
					}
					// if (options.dropoff) {
					// 	alert('dsadas')
					// 	htmlEl.css('font-size', 'none');
					// 	return;
					// };
				}
				htmlEl.css('font-size', options.fontsize * factor);
				if (options.dropoff && frontline > options.threshold) {
					// alert('dsadas')
					htmlEl.css('font-size', '')
				};
			}
			//屏幕方向探测器
			function orientationSensor(callback) {
				var windowWidth = $(window).width(),
					windowHeight = $(window).height(),
					orientation = '';
				checkoritation();
				$(window).resize(function() {
					checkoritation();
				});

				function checkoritation() {
					if (typeof(callback) != 'undefined') {
						if (windowWidth < windowHeight) {
							return callback.portrait();
						} else {
							return callback.landscape();
						}
					} else {
						callback = {
							portrait: function() {},
							landscape: function() {}
						}
					}
				}
				//console.log((frontline < windowHeight) ? orientation = 'portrait' : orientation = 'landscape')
				return (windowWidth < windowHeight) ? orientation = 'portrait' : orientation = 'landscape';
			}
		}
		
	});

})(jQuery, window);
