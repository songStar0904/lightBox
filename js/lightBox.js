/*
 * @Author: Administrator
 * @Date:   2017-06-05 12:17:10
 * @Last Modified by:   Administrator
 * @Last Modified time: 2017-06-06 22:55:29
 */

'use strict';
(function() {
    var lightBox = function(config) {
        var _this = this;

        //默认参数
        this.config = {
        	speed:300,
        	maxWidth:900,
        	maxHeight:600,
        	maskOpacity:0.5
        	
        };
        $.extend(this.config, config || {});
        //创建遮罩和弹出层
        this.popupMask = $('<div id="lightBox-mask">');
        this.popupBox = $('<div id="lightBox-popup">');

        //保存body
        this.bodyNode = $(document.body);

        //渲染到body
        this.renderDom();

        this.picView = this.popupBox.find('.lightBox-pic-view');//图片预览区域
        this.popupPic = this.popupBox.find('.lightBox-img');//图片
        this.picCation = this.popupBox.find('.lightBox-pic-caption');//图片描述
        this.nextBtn = this.popupBox.find('.lightBox-next-btn');
        this.prevBtn = this.popupBox.find('.lightBox-prev-btn');
        this.picTitle = this.popupBox.find('.lightBox-pic-title');
        this.currentIndex = this.popupBox.find('.lightBox-index');
        this.closeBtn = this.popupBox.find('.lightBox-close-btn');



        this.groupName = null;
        this.groupData = [];
        //事件委托，获取数组数据
        var lightbox = $('[data-role=lightbox]');
        lightbox.on('click', this.bodyNode, function(event) {
        	event.preventDefault();
        	//阻止事件冒泡
        	event.stopPropagation();

        	var currentGroupName = $(this).attr('data-group');
        	//是否点开同一组
        	if(currentGroupName != _this.groupName){
        		_this.groupName = currentGroupName;
        		_this.getgroup();//console.log($(this).attr('data-group'));
        	}
        	//初始化弹出层
        	_this.initPopup($(this));
        	
        });

        //关闭弹出层和遮罩
        this.popupMask.click(function(event) {
            _this.close();
        });
        this.closeBtn.click(function(event) {
        	_this.close();
        });

        //绑定左右切换图片
        this.nextBtn.hover(function() {
        	if(_this.isShowBtn($(this))){
        		$(this).css('opacity','1');
        	}
        }, function() {
        	if(_this.isShowBtn($(this))){
        		$(this).css('opacity','0');
        	}
        }).click(function(event) {
        	if(!$(this).hasClass('disabled')){
        		event.stopPropagation();
        		_this.goto('next');
        	}
        });
        this.prevBtn.hover(function() {
        	if(_this.isShowBtn($(this))){
        		$(this).css('opacity','1');
        	}
        }, function() {
        	if(_this.isShowBtn($(this))){
        		$(this).css('opacity','0');
        	}
        }).click(function(event) {
        	if(!$(this).hasClass('disabled')){
        		event.stopPropagation();
        		_this.goto('prev');
        	}
        });

        //绑定窗口调整事件和按键事件
        var timer = null;
        this.clear = false;
        $(window).resize(function(event) {
        	if(_this.clear){
        		window.clearTimeout(timer);
                timer = window.setTimeout(function(){
                	_this.loadPic(_this.groupData[_this.index].src);
                }, 500);
        	}  
        }).keyup(function(event) {
          var keyVal = event.which;
          //console.log(keyVal);
          if(keyVal === 37 || keyVal === 38){//上左键
          _this.prevBtn.trigger('click');//trigger() 方法触发被选元素的指定事件类型。
          }else if( keyVal === 39 || keyVal === 40){//下右键
          	_this.nextBtn.trigger('click');
          }else if( keyVal === 27){//esc键
          _this.closeBtn.trigger('click');
          }
        });
    };
    lightBox.prototype = {

    	renderDom:function(){
    		var popupHtml = `<div class="lightBox-pic-view">
                    	    <span class="lightBox-btn lightBox-prev-btn disabled">
                            <span class="glyphicon glyphicon-menu-left"></span>
                            </span>
                    		<img src="" alt="" class="lightBox-img" />
                    		<span class="lightBox-btn lightBox-next-btn disabled">
                            <span class="glyphicon glyphicon-menu-right"></span>
                            </span>
                    	    </div>
                    	    <div class="lightBox-pic-caption">
                    		<span class="lightBox-pic-title">
                            </span><span class="lightBox-index"></span>
                    		<span class="lightBox-close-btn glyphicon glyphicon-remove"></span>
                    	    </div>`;
        	//将popuphtml放入popupBox里
        	this.popupBox.html(popupHtml);
        	//将遮罩和弹出层插入值body
        	this.bodyNode.append(this.popupMask,this.popupBox);
    	},
        close: function(){
            this.prevBtn.addClass('disabled');
            this.nextBtn.addClass('disabled');
            this.popupMask.fadeOut();
            this.popupBox.fadeOut();
            this.clear = false;
        },
        // 是否展示左右点击按钮
        isShowBtn: function(el){
            return !el.hasClass('disabled') && this.groupData.length > 1
        },
        // 获得同组元素的属性
    	getgroup:function(){
    		var _this = this;
    		//清空之前数据
    		_this.groupData.length = 0;
    		var groupList = this.bodyNode.find('[data-group='+this.groupName+']');
    		//console.log(groupList);
    		groupList.each(function(index, el) {
    			_this.groupData.push({
    				src: $(this).attr('data-source'),
    				id: $(this).attr('data-id'),
    				caption: $(this).attr('data-caption'),
    			});
    		});
    		//console.log(_this);
    	},
        // 初始化弹出层
    	initPopup:function(currentData){
    		var currentSrc = currentData.attr('data-source'),
    		    currentId = currentData.attr('data-id');
    		this.showPopup(currentSrc, currentId);
    	},
        // 显示图片弹出层
    	showPopup:function(src, id){
    		var _this=this;
    		//console.log(src);
    		this.popupPic.hide();
    		this.picCation.hide();

    		this.popupMask.css('opacity', this.config.maskOpacity).fadeIn();//配置遮罩透明度及显示

    		var winWidth = $(window).width(),
    		    winHeight = $(window).height();

    		this.picView.css({
    			width: winWidth / 2,
    			height: winHeight / 2
    		});
    		this.popupBox.fadeIn();

    		var viewHeight = winHeight / 2 + 10;
    		var viewWidth = winWidth / 2 + 10;
    		this.popupBox.css({
    			width: viewWidth,
    			height: viewHeight,
    			marginLeft: (viewWidth)/2,
    			top: -viewHeight
    		}).animate({
    			top: (winHeight - viewHeight) / 2
    		}, _this.config.speed, function(){
                // 加载数据
    			_this.loadPic(src);
    		});
    		//获取点击元素id的索引
    		this.index = this.getIndex(id);

    		var groupLength = this.groupData.length;
    		if(groupLength > 1){
    			if(this.index === 0){
    				this.prevBtn.addClass('disabled');
    				this.nextBtn.removeClass('disabled');
    			}else if(this.index === groupLength - 1){
    				this.prevBtn.removeClass('disabled');
    				this.nextBtn.addClass('disabled');
    			}else{
    				this.prevBtn.removeClass('disabled');
    				this.nextBtn.removeClass('disabled');
    			}
    		}
    		//console.log(this);
    	},
        // 获得当前索引
    	getIndex: function(currentId){
    		var index = 0;
    		$(this.groupData).each(function(i){
    			index = i;
    			if(this.id === currentId){
    				return false;//相当于break
    			}
    		});
    		return index;
    	},
        // 加载图片
    	loadPic: function(src){
    		var _this = this;
    		//重置图片高宽
    		_this.popupPic.css({'width':'auto','height':'auto'}).hide();
    		_this.picCation.hide();
    		//预加载图片
    		this.preLoadPic(src, function(){
    			_this.popupPic.attr('src', src);
    			var picWidth = _this.popupPic.width(),
    			    picHeight = _this.popupPic.height(),
                    //配置图片的宽高值
    			    config = _this.config;
    			picWidth = picWidth > config.maxWidth ? config.maxWidth : picWidth;
    			picHeight = picHeight > config.maxHeight ? config.maxHeight : picHeight;
    			//console.log(_this,picWidth,picHeight);
    			//改变图片宽高
    			_this.changePic(picWidth,picHeight);
    		})
    	},
        // 预加载图片
    	preLoadPic: function(src, callback){
    		var img = new Image();
    		if(!!window.ActiveXObject){//ie浏览器图片预加载判断
    			img.onreadystatechange = function(){
    				if(this.readyState == 'complete'){
    					callback();
    				}
    			};
    		}else{//非ie浏览器图片预加载判断
    			img.onload = function(){
    				callback();
    			};
    		}
    		img.src = src;
    	},
        // 改变图片的宽高
    	changePic: function(picWidth, picHeight){
    		var _this = this,
    		    winHeight = $(window).height(),
    		    winWidth = $(window).width();

    		// 防止图片大于浏览器视口
    		var scale = Math.min(winWidth / (picWidth + 10), winHeight / (picHeight + 10), 1);
    		picWidth = picWidth * scale;
    		picHeight = picHeight * scale;
    		this.picView.animate({
    			width: picWidth,
    			height: picHeight
    		}, _this.config.speed);
    		this.popupBox.animate({
    			width: picWidth,
    			height: picHeight,
    			marginLeft: (winWidth - picWidth) / 2,
    			top: (winHeight - picHeight) / 2
    		}, _this.config.speed, function(){
    			_this.popupPic.css({
        			width: picWidth - 10,
        			height: picHeight - 10,
    			}).fadeIn();
    			_this.picCation.fadeIn();
    			_this.clear = true;
    		});
    		//设置描述和索引
    		this.picTitle.text(this.groupData[this.index].caption);
    		this.currentIndex.text(`当前索引:${this.index+1} / ${this.groupData.length}`);
    	},
    	goto:function(type){
    		var _this=this;
    		if(type==='next'){
    			_this.index++;
    			if(this.index>=this.groupData.length-1){
    				this.nextBtn.addClass('disabled');
    			}
    			if(this.index!=0){
    				this.prevBtn.removeClass('disabled').css('opacity','0');
    			}
    			var src=this.groupData[this.index].src;
    			this.loadPic(src);
    		}else if(type==='prev'){
    			_this.index--;
    			if(this.index===0){
    				this.prevBtn.addClass('disabled');
    			}
    			if(this.index<this.groupData.length-1){
    				this.nextBtn.removeClass('disabled').css('opacity','0');
    			}
    			var src=this.groupData[this.index].src;
    			this.loadPic(src);
    		}
    	}


    };
    window.lightBox = lightBox;
})();
