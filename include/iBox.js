(function($) {
	var boxobj = {
        //对话框对象是否存在
		objs		: false,
        //窗体是否已打开
		isopen      : false,
        //一个定时器
        timehandle  : null,
        //页面上需要隐藏的表单
        hiddenobj   : null,
		//对话框
		dh 		    : null,
		//遮罩
		mh 		    : null,
		//对话框内容
		dc			: null,
		//对话框标题
		dt			: null,
		//对话框按钮栏
		db			: null,
        //对话框确定按钮
        dbok        : null,
        //对话框取消按钮
        dbcancel    : null,
		//选择器标示
		selector 	: null,
		//ajax路径
		ajaxurl 	: null,
		//属性
		options 	: null,
		//窗体内容
		content 	: null,
		//默认设置
		_defaults 	: {
			//标题
			title           : '提示',
			//窗体宽
			width           : 0,
			//窗体高
			height          : 0,
			//自动关闭时间
			timeout         : 0,
			//是否可拖动
			draggable       : true,
			//是否有遮罩层
			modal           : true,
			//显示位置
			position        : 'center',
			//是否显示标题
			showTitle       : true,
            //是否显示按钮栏
			showButton      : true,
			//是否显示取消按钮
			showCancel      : false,
			//是否显示确定按钮
			showOk          : true,
			//确定按钮名称
			okBtnName       : '关闭',
			//取消按钮名称
			cancelBtnName   : '取消',
			//内容格式,默认表示为文本格式
			contentType     : 'text',
			//要提交的地址，可由对话框提交到指定地址
			formSubmit      : null,
			//服务器通信值，用于验证此次提交是否是伪造的
			secretvalue     : '',
			//层z坐标
            zIndex          : 1,
			//窗口关闭事件
            onclose         : null,
			//窗口打开事件
            onopen          : null,
			//取消按钮的事件
            oncancel        : null,
			//关闭按钮的事件
            onok            : null
		},

        /**
        * 初始化值
        */
		initOptions : function(_content, _options) {
            var myDate = new Date();
            var undefined;
            var self = this;

            var __options                = _options                != undefined ? _options : {};
			self.content                 = _content                != undefined ? _content : '';
			self._defaults.formSubmit    = __options.formSubmit    != undefined ? __options.formSubmit : self._defaults.formSubmit;
			self._defaults.secretvalue   = __options.secretvalue   != undefined ? __options.secretvalue : self._defaults.secretvalue;
			self._defaults.timeout       = __options.timeout       != undefined ? parseInt(__options.timeout,10) : self._defaults.timeout;
			self._defaults.title         = __options.title         != undefined ? __options.title : self._defaults.title;
			self._defaults.contentType   = __options.contentType   != undefined ? __options.contentType : self._defaults.contentType;
			self._defaults.showButton    = __options.showButton    != undefined ? __options.showButton : self._defaults.showButton;
			self._defaults.showCancel    = __options.showCancel    != undefined ? __options.showCancel : self._defaults.showCancel;
			self._defaults.showOk        = __options.showOk        != undefined ? __options.showOk : self._defaults.showOk;
			self._defaults.okBtnName     = __options.okBtnName     != undefined ? __options.okBtnName : self._defaults.okBtnName;
			self._defaults.cancelBtnName = __options.cancelBtnName != undefined ? __options.cancelBtnName : self._defaults.cancelBtnName;
			self._defaults.modal         = __options.modal         != undefined ? __options.modal : self._defaults.modal;
			self._defaults.position      = __options.position      != undefined ? __options.position : self._defaults.position;
			self._defaults.draggable     = __options.draggable     != undefined ? __options.draggable : self._defaults.draggable;
			self._defaults.width         = __options.width         != undefined ? __options.width : self._defaults.width;
			self._defaults.height        = __options.height        != undefined ? __options.height : self._defaults.height;
			self._defaults.oncancel      = __options.oncancel      != undefined ? __options.oncancel : self._defaults.oncancel;
			self._defaults.onok          = __options.onok          != undefined ? __options.onok : self._defaults.onok;
			self._defaults.onopen        = __options.onopen        != undefined ? __options.onopen : self._defaults.onopen;
			self._defaults.onclose       = __options.onclose       != undefined ? __options.onclose : self._defaults.onclose;
			self._defaults.zIndex        = Math.floor( myDate.getTime() / 1000 );
            self.options                 = self._defaults;
			self._defaults               = null;
            __options = null;
            self.hiddenobj = $('embed, object, select');
            self.hiddenobj.css({ 'visibility' : 'hidden' });
		},
		/**
		 * 初始化弹窗Box
		 *  '<div class="weedialog">' +
			'	<div class="dialog-header">' +
			'		<div class="dialog-tl"></div>' +
			'		<div class="dialog-tc">' +
			'			<div class="dialog-tc1"></div>' +
			'			<div class="dialog-tc2"><span class="dialog-title"></span></div>' +
			'		</div>' +
			'		<div class="dialog-tr"></div>' +
			'	</div>' +
			'	<table width="100%" border="0" cellspacing="0" cellpadding="0" >' +
			'		<tr>' +
			'			<td class="dialog-cl"></td>' +
			'			<td>' +
			'				<div class="dialog-content"></div>' +
			'				<div class="dialog-button">' +
			'					<input type="button" class="dialog-ok" value="确定">' +
			'					<input type="button" class="dialog-cancel" value="取消">' +
			'				</div>' +
			'			</td>' +
			'			<td class="dialog-cr"></td>' +
			'		</tr>' +
			'	</table>' +
			'	<div class="dialog-bot">' +
			'		<div class="dialog-bl"></div>' +
			'		<div class="dialog-bc"></div>' +
			'		<div class="dialog-br"></div>' +
			'	</div>' +
			'</div>'
		 * 
		 * */

        /**
        * 初始化对话框
        */
		initBox : function() {
            var self = this;
            //构造一个提交表单
			if(self.options.formSubmit){
				var submod = '<FORM id="formbox" action="'+self.options.formSubmit+'" method="post" target="_self"><INPUT type="hidden" value="'+self.options.secretvalue+'" id="secretname" name="secretname"><div id="dialogcontent" class="dialog-content"></div></FORM>';
			}
			else{
				var submod = '<div id="dialogcontent" class="dialog-content"></div>';
			}
			var html =  '<div class="weedialog"><div id="dialogheader" class="dialog-header"><div class="dialog-tl"></div><div class="dialog-tc"><div class="dialog-tc1"></div><div class="dialog-tc2"><span id="dialogtitle" class="dialog-title"></span></div></div><div class="dialog-tr"></div></div><table width="100%" border="0" cellspacing="0" cellpadding="0" ><tr><td class="dialog-cl"></td><td>'+submod+'<div id="dialogbutton" class="dialog-button"><input type="button" id="dialogok" class="dialog-ok" value="确定"><input type="button" id="dialogcancel" class="dialog-cancel" value="取消"></div></td><td class="dialog-cr"></td></tr></table><div class="dialog-bot"><div class="dialog-bl"></div><div class="dialog-bc"></div><div class="dialog-br"></div></div></div>';
			self.dh = $(html).appendTo('body').css({
                position: 'absolute',	
                overflow: 'hidden',
                opacity: 0,
                zIndex: self.options.zIndex
            });
			self.dc = self.dh.find('#dialogcontent');
			self.dt = self.dh.find('#dialogtitle');
			self.db = self.dh.find('#dialogbutton');
            self.dbok = self.dh.find("#dialogok");
            self.dbcancel = self.dh.find("#dialogcancel");
			self.dbok.val(self.options.okBtnName);
			self.dbcancel.val(self.options.cancelBtnName);	
			self.dt.html(self.options.title);
			if (!self.options.showButton)
				self.db.hide();
			if (!self.options.showCancel)
				self.dbcancel.hide();
			if (!self.options.showOk)
				self.dbok.hide();
		},

        /**
        * 初始化遮罩
        */
		initMask : function() {
            var self = this;
			self.mh = $('<div id="dialogmask" class="dialog-mask"></div>')
                        .appendTo('body').css({
                        opacity: 0,
                        width: self.bwidth(),
                        height: self.bheight(),
                        zIndex: self.options.zIndex-1
			});
		},

        /**
        * 初始化按钮事件
        */
		initEvent : function() {
            var self = this;
			self.dbok.unbind('click').click(function(){self.close();});
            self.dbcancel.unbind('click').click(function(){self.close();});
			if (typeof(self.options.onok) == "function")
				self.dbok.unbind('click').click(function(){self.options.onok(self);});
			if (typeof(self.options.oncancel) == "function")
				self.dbcancel.unbind('click').click(function(){self.options.oncancel(self);});
		},

        /**
        * 初始化弹窗内容
        */
		initContent : function(_content) {
            var self = this;
			//用jquery选择器获取指定的表单的值
			if (self.options.contentType == "selector") {
				self.selector = self.content;
				self.content = $(self.selector).html();
				self.setContent(self.content);
				self.show();
				self.onopen();
			}
			else if (self.options.contentType == "ajax") {
				self.ajaxurl = self.content;
				if (self.ajaxurl.indexOf('?') == -1) {
					self.ajaxurl += "?_t="+Math.random();
				} else {
					self.ajaxurl += "&_t="+Math.random();
				}
				self.setLoading();
				self.show();
				$.ajax({
					url: self.ajaxurl,
					success: function(xml){
						self.content = xml;
						self.setContent(self.content);
						self.db.show();
				   },
				   error: function(){
					   self.content = '获取远程地址失败，请重试！';
					   self.setContent(self.content);
					   self.dbok.show();
					   self.dbok.hide();
					   self.dhok.val('关闭');
				   }
				});
			}
			else if (self.options.contentType == "sget") {
				self.ajaxurl = self.content;
				if (self.ajaxurl.indexOf('?') == -1) {
					self.ajaxurl += "?_t="+Math.random();
				} else {
					self.ajaxurl += "&_t="+Math.random();
				}
				self.setLoading();
				self.show();
				$.get(self.ajaxurl,function(xml){
							self.content = xml;
							self.setContent(self.content);
							self.db.show();
					   }
				);
			}
			else {
				self.setContent(self.content);
				self.show();
				self.onopen();
			}
		},

        /**
        * 弹窗拖拽事件
        */
		drag : function() {
            var self = this;
			if (self.options.draggable && self.options.showTitle) {
				self.dh.find('#dialogheader').mousedown(function(event){
					var h  = this;
					var o  = document;
					var ox = self.dh.position().left;
					var oy = self.dh.position().top;
					var mx = event.clientX;
					var my = event.clientY;
					var width = self.dh.width();
					var height = self.dh.height();
					var bwidth = self.bwidth();
					var bheight = self.bheight();
			        if(h.setCapture)
			            h.setCapture();
					$(document).mousemove(function(event){
						if (window.getSelection)
							window.getSelection().removeAllRanges();
						else
				        	document.selection.empty();
						var left = Math.max(ox+event.clientX-mx, 0);
						var top = Math.max(oy+event.clientY-my, 0);
						var left = Math.min(left, bwidth-width);
						var top = Math.min(top, bheight-height);
						self.dh.css({left: left, top: top});
					}).mouseup(function(){
						if(h.releaseCapture)
			                h.releaseCapture();
				        $(document).unbind('mousemove');
				        $(document).unbind('mouseup');
					});
				});
			}	
		},

        /**
        * 检测并执行窗口打开前绑定事件
        */
		onopen : function() {
            var self = this;
			if (typeof(self.options.onopen) == "function")
				self.options.onopen(self);
			if ( self.options.timeout > 0 ) {
				self.setTitle('(<font color="red">'+self.options.timeout+'</font>秒后关闭) '+self.options.title);
				self.timehandle = setInterval(function(){
					self.options.timeout --;
					self.dt.find('font').html(self.options.timeout);
					if (self.options.timeout <= 0) {
						self.close();
						clearInterval(self.timehandle);
					}
				}, 1000);
			}
		},

        /**
        * 显示弹窗
        */
		show : function() {
            var self = this;
			var wnd = $(window), doc = $(document),
				pTop = doc.scrollTop(),	pLeft = doc.scrollLeft();
            var showdh = function(){
                self.dh.fadeTo(250, 1);
                self.drag();
                self.dbok.focus();
            };
			if (self.options.position == 'center') {
				pTop += (wnd.height() - self.dh.height()) / 2 - 80;
				pLeft += (wnd.width() - self.dh.width()) / 2;
				self.dh.css({top: pTop, left: pLeft});
			}
			else {
				pTop = self.options.position;
				pLeft += (wnd.width() - self.dh.width()) / 2;
				self.dh.css({top: pTop, left: pLeft});
			}
            self.mh.fadeTo(200, 0.5, function(){showdh();});
		},

        /**
        * 在弹窗内查找元素
        */
		find : function(selector) {
			return this.dh.find(selector);
		},

        /**
        * 设置ajax加载时显示一个加载状态
        */
		setLoading : function() {
			this.setContent('<div class="dialog-loading"></div>');
			this.db.hide();
		},

        /**
        * 设置窗体宽度
        */
		setWidth : function(width) {
			this.dh.width(width);
			this.options.width = width;
		},

        /**
        * 设置标题
        */
		setTitle : function(title) {
			this.dt.html(title);
		},

        /**
        * 取得标题
        */
		getTitle : function() {
			return this.dt.html();
		},

        /**
        * 设置内容
        */
		setContent : function(content) {
            var self = this;
			self.dc.html(content);
			if (self.options.height > 0)
				self.dc.css('height', self.options.height);//高度要设置为显示内容的层的高度
			if (self.options.width > 0)
				self.dh.css('width', self.options.width);//宽度要设置为外面层的宽度
		},

        /**
        * 取得内容
        */
		getContent : function() {
			return this.dc.html();
		},

        /**
        * 隐藏内容框
        */
		hideContent : function(){
			this.dc.hide();
		},

        /**
        * 隐藏按钮
        * 
        * @param btname	按钮的名称
        */
		hideButton : function(btname) {
			this.dh.find('#dialog'+btname).hide();
		},

        /**
        * 显示按钮
        * 
        * @param btname	按钮的名称
        */
		showButton : function(btname) {
			this.dh.find('#dialog'+btname).show();
		},

        /**
        * 设置按钮标题
        */
		setButtonTitle : function(btname, title) {
			this.dh.find('#dialog'+btname).val(title);
		},

        /**
        * 关闭弹窗
        */
		close : function() {
            var self = this;
            var movemh = function(){
                if (self.mh) {
                    self.mh.fadeOut("normal",function() {
                        self.mh.remove();
                        //jquery会缓存对象，所以需要用js的方法来取得值
                        //当有两个以上的遮罩层时不能够在第一层的遮罩取消后就显示，当不存在遮罩层时才显示这些隐藏表单
                        if(!document.getElementById('dialogmask')){
                            self.hiddenobj.css({ 'visibility' : 'visible' });
                        }
                        if (typeof(self.options.onclose) == "function") {
                            self.options.onclose(self);
                        }
                    });
                }
            };
			self.dh.fadeOut("fast",function() { self.dh.remove();movemh(); });
			self.isopen = false;
            try{//当定时器没有执行完就关闭窗口需要清空这个定时器
                if(self.options.timeout > 0)
                    clearInterval(self.timehandle);
            }catch(e){};
		},
        
        /**
        * 对嵌套窗口的关闭动作，当有嵌套页面出现时可以在前端关闭事件中手动调用这个方法
        */
        close_nesting : function() {
            $("body link,script[async=true]").remove();//删除在body中多余的元素，这些元素一般出现在嵌套窗口中
        },

        /**
        * 取得遮罩高度
        */
		bheight : function() {
			if ($.browser.msie && $.browser.version < 7) {
				var scrollHeight = Math.max(
					document.documentElement.scrollHeight,
					document.body.scrollHeight
				);
				var offsetHeight = Math.max(
					document.documentElement.offsetHeight,
					document.body.offsetHeight
				);
				if (scrollHeight < offsetHeight)
					return $(window).height();
				else
					return scrollHeight;
			} else {
				return $(document).height();
			}
		},

        /**
        * 取得遮罩宽度
        */
		bwidth : function() {
			if ($.browser.msie && $.browser.version < 7) {
				var scrollWidth = Math.max(
					document.documentElement.scrollWidth,
					document.body.scrollWidth
				);
				var offsetWidth = Math.max(
					document.documentElement.offsetWidth,
					document.body.offsetWidth
				);
				if (scrollWidth < offsetWidth)
					return $(window).width();
				else
					return scrollWidth;
			} else {
				return $(document).width();
			}
		},

        /**
        * 恢复初始值
        */
		defaultBox : function () {
            var self = this;
            self.timehandle = null;
			self.dh 		= null;
			self.mh 		= null;
			self.dc			= null;
			self.dt			= null;
			self.db			= null;
            self.dbok       = null;
            self.dbcancel   = null;
			self.selector 	= null;
			self.ajaxurl 	= null;
			self.options 	= null;
			self.content 	= null;
			self._defaults 	= {
				title        : '提示',
				width        : 0,
				height       : 0,
				timeout      : 0,
				draggable    : true,
				modal        : true,
				position     : 'center',
				showTitle    : true,
				showButton   : true,
				showCancel   : false, 
				showOk       : true,
				okBtnName    : '关闭',
				cancelBtnName: '取消',
				contentType  : 'text',
				zIndex       : 1,
				onclose      : null,
				onopen       : null,
				oncancel     : null,
				onok         : null
			};
		},

        /**
        * 打开对话框
        * 
        * @param content 对话框内容
        * @param options 运行参数
        */
		open : function (_content, _options) {
			if(!this.isopen){
				this.isopen = true;
				if(this.objs) this.defaultBox();
				this.objs = true;
				this.initOptions(_content, _options);
				this.initMask();
				this.initBox();
				this.initEvent();
				this.initContent();
			}
		}
	};
	$.extend( {iBox : boxobj} );
})(jQuery);