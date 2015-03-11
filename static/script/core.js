$(function(){
	
	// iNote
	iNote = {
		setting:{
			page:'.content',
			mark:'mark-1',
			oldMark:'mark-1',
			tools:'.tool-bar',
			noteDlg:'.note-dlg',
			noteWindow:'#note-window'
		},

		init:function(){

			this._bind();

		},

		_currentTag:'',

		_lastClickTime:Date.parse(new Date()),

		_setFocus:function(tag){
			$('.mark-focus').removeClass('mark-focus');
			tag.addClass('mark-focus');
		},

		_clearFocus:function(tag){
			tag.removeClass('mark-focus');
		},

		_generateGUID:function(){

			function _g(){
				   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			}

			var guid = 't' + _g();

			if($('#' + guid).length)
				return _generateGUID();
			else
				return guid;
		},

		_removeAllMarkStyle:function(tag){
				tag.removeClass(tag.attr('data-pclass'));
		},

		_changeMark:function(tag){

			this._removeAllMarkStyle(tag);
			tag.addClass(this.setting.mark);
			tag.attr('data-pclass',this.setting.mark);
			this._currentTag = null;
		},

		_isMark:function(tag){
			return tag.hasClass('mark');
		},

		_setMark:function(tag){

			var me = this,
				html = '',
				uid;

			var textBefore = '',
				text = '',
				textAfter = '';

			var tagPrev = tag.prev('.tag'),
				tagNext = tag.next('.tag');

			// case 1:当文字两边都被标记时并且填满
			var condition1 =   me._isMark(tagPrev) 
							&& me._isMark(tagNext) 
							&& tag.text().length == me.getSelect().text.length;

			// case 2:
			var condition2_1 =  me._isMark(tagPrev)
							 &&!me._isMark(tag)
							 &&(me.getSelect().startIndex == 0);

			
			if(condition1 || condition2_1){

					text = me.getSelect().text;
					textAfter = tag.html().substr(text.length,tag.html().length);

					uid = me._generateGUID();

					html = '<span id="' + uid + '" data-pclass="' +  me.setting.mark + '" class="tag ' + 'mark ' + me.setting.mark + '" id="' + uid + '">' + text + '</span>';

					if(textAfter)
						   html += '<span class="tag">' + textAfter + '</span>';

					tag.get(0).outerHTML = html;
					// me._setFocus($('#' + uid));

					me._postData($('#' + uid).closest('.p'));
			}


			if((   me.getSelect().startIndex < me.getSelect().endIndex
				&&!tag.hasClass('mark'))
				|| me.setting.mark == 'pencil-empty'){
				textBefore = tag.html().substr(0,me.getSelect().startIndex);
				text = me.getSelect().text;
				textAfter = tag.html().substr(me.getSelect().endIndex,tag.html().length);
				
				console.log('before:' + textBefore);
				console.log('text:' + text);
				console.log('after:' + textAfter);

				uid = me._generateGUID();

				html = '<span class="tag">' + textBefore + '</span>' + 
					   '<span data-pclass="' +  me.setting.mark + '" class="tag ' + 'mark ' + me.setting.mark + '" id="' + uid + '">' + text + '</span>' +
					   '<span class="tag">' + textAfter + '</span>';

				tag.get(0).outerHTML = html;

				// me._currentTag = $('#' + uid);
				// me._setFocus($('#' + uid));
				me._postData($('#' + uid).closest('.p'));
			}

			me._currentTag = null;
		},

		_clearMark:function(tag){
			//合并
			var prev = tag.prev('.tag'),
				next = tag.next('.tag');

			var prevTxt = '',
				nextTxt = '',
				s = false;

			tag.removeClass('mark');

			if(!prev.hasClass('mark')){
				prevTxt = prev.text();
				prev.remove();
			}

			if(!next.hasClass('mark')){
				nextTxt = next.text();
				next.remove();
			}

			tag.text(prevTxt + tag.text() + nextTxt);
			this._removeAllMarkStyle(tag);
			tag.removeAttr('id');
			tag.removeAttr('data-pclass');
			


			this._setTool(this.setting.oldMark);
			this._clearFocus(tag);

			me._postData(tag.closest('.p'));
		},

		_setTool:function(tag){
			//画笔归位
			var pclass = '';

			if(   typeof tag == 'object'
				&&tag.hasClass('mark')){
				pclass = tag.attr('data-pclass') || this.setting.mark;
					
			}else if(typeof tag == 'string'){
				pclass = tag;
			}

			$('.pencil').removeClass('tool-active');
			$('.pencil[data-pclass=' + pclass + ']').addClass('tool-active');	
			this.setting.mark = pclass;	
		},

		_showNoteDlg:function(tag,mouseX,mouseY){
			var $dlg = $('.note-dlg');

			var left = mouseX,
				top = mouseY;

			var middle = $(window).width()/2;

			if(left < middle){
				$dlg.css({left:10,top:tag.offset().top,right:'auto'});
			}
			else
				$dlg.css({right:10,top:tag.offset().top,left:'auto'});

			$('.note-dlg .note').val(tag.attr('data-note'));
			$('.note-dlg').fadeIn();
		},

		_hideNoteDlg:function(){
			$('.note-dlg').hide();
		},

		_showNoteWindow:function(tag){

			if(tag){
				var win = $(this.setting.noteWindow);

				win.find('.summary').text(tag.text());
				win.find('.note').val(tag.attr('data-note'));
				$('body').css('overflow','hidden');
				$('.mask').show();
				win.fadeIn();
			}else{
				alert('请先选中笔记');
			}
			
		},

		_hideNoteWindow:function(){
			$(this.setting.noteWindow).fadeOut();
			$('.mask').hide();
			$('body').css('overflow-y','auto');
		},

		_postData:function(p){
			var tagsData = [],
				json = {
					pIndex:p.attr('data-index'),
					tags:tagsData
				};

			var tags = p.find('.tag'),
				len = tags.length,
				i = 0,
				index = 0,
				obj;

			for(i = 0 ; i < len;i++){

				var tag = $(tags[i]);

				if(tag.hasClass('mark')){

					obj = {
						startIndex:index,
						endIndex:index + tag.text().length,
						mark:tag.attr('data-pclass'),
						text:tag.text(),
						note:tag.attr('data-note') || '',
						id:tag.attr('id')
					};

					tagsData.push(obj);
				}

				index += tag.text().length;
			}

			if(json.tags.length){
				console.log('post:' + JSON.stringify(json));
				return JSON.stringify(json);
			}
		},

		_paragraphProducer:function(json){
			var obj = JSON.parse(json),
				index = 0,
				i,html = '',
				len = obj.tags.length,
				oLen = 0,
				text = '';


			var p = $('.p[data-index=' + obj.pIndex + ']'),
				originText = p.text();

			var i = 0;


			for(i = 0; i < obj.tags.length;i++){

				// 截取非笔记字段
				if(index != obj.tags[i].startIndex){
					prevText = originText.substring(index,obj.tags[i].startIndex);
					index = obj.tags[i].startIndex;
					html += '<span class="tag">' + prevText + '</span>'; 
				}
				
				text = originText.substring(index,obj.tags[i].endIndex);
				index = obj.tags[i].endIndex;
				html += '<span data-note="' + obj.tags[i].note + '"  data-pclass="' + obj.tags[i].mark + '" id="' + obj.tags[i].id + '" class="tag mark ' + obj.tags[i].mark + '">' + text + '</span>'
			}

			// 结尾
			if(index != originText.length){
				html += '<span class="tag">' + originText.substring(index,originText.length) + '</span>'; 
			}

			$('.p[data-index=' + obj.pIndex + ']').html(html);
		},

		_bind:function(){
			var $page = $(this.setting.page),
				me = this;

			
			var pencil = '';

			$page.on('click',function(){
			});

			// 保存笔记
			$('#noteSaveBtn').on('click',function(){
				if(me._currentTag){
					me._currentTag.attr('data-note',$(me.setting.noteWindow + ' .note').val());
					// var obj = me._postData(me._currentTag.closest('.p'));
					// me._paragraphProducer(obj);
					me._hideNoteWindow();
					$(me.setting.noteWindow).find('form').get(0).reset();
				}
			});

			// 保存笔记
			$('#noteCancelBtn').on('click',function(){
				me._hideNoteWindow();
			});

			// 点击打开笔记
			$('#openNote').on('click',function(){
				 me._showNoteWindow(me._currentTag);
			});

			// 点击遮罩
			$('.mask').on('click',function(){
				me._hideNoteWindow();
			});

			// 单机tag
			$(document).on('click','.tag',function(event){
				console.log(me.getSelect().obj);

				me._hideNoteDlg();

				me._currentTag = $(this);

				if(   me.setting.mark == 'mark-empty' 
					&&!me._isMark(me._currentTag)){
					me._setTool(me.setting.oldMark);
					return;	
				}

				if(me._isMark(me._currentTag)){
					me._setTool(me._currentTag.attr('data-pclass'));
					me._setFocus(me._currentTag);
					return;
				}
				else
					me._setTool(me.setting.mark);

				// var timestamp = Date.parse(new Date());
				// if(timestamp - me._lastClickTime <= 1000)
				// 	return;
				// me._lastClickTime = timestamp;

				me._setMark(me._currentTag);
				

				
			});

			// 选择画笔
			$('.pencil').on('click',function(){

				me.setting.mark = $(this).attr('data-pclass');
				
				$('.pencil').removeClass('tool-active');
				$(this).addClass('tool-active');

				if(me._currentTag){
	

					if(me.setting.mark != 'mark-empty'){
						me._clearFocus(me._currentTag);
						me._changeMark(me._currentTag);
						me._hideNoteDlg();
					}else{
						me._clearMark(me._currentTag);
					}
				}

				if(me.setting.mark != 'mark-empty')
					me.setting.oldMark = 'mark-1';

			});

		},

		getSelect:function(){
			var txt = '',
				obj = {},
				startIndex = 0,
				endIndex = 0;

			if(window.getSelection){
				obj = window.getSelection();
			    txt =  obj + '';
			    startIndex = obj.anchorOffset != null ? obj.anchorOffset : obj.baseOffset;
			    endIndex = obj.extentOffset != null ? obj.extentOffset : obj.focusOffset;
			  }else if(document.selection){
			  	obj = document.selection;
			  	startIndex = obj.anchorOffset;
		    	txt =  obj.createRange().text  + '';
	        	}

	        return {
	        	text:txt,
	        	obj:obj,
	        	startIndex:startIndex,
	        	endIndex:endIndex
	        };
		}
	};

	iNote.init();

	// menu
	$('#account .wrapper').on({
		click:function(){
			$(this).find('ul').slideDown();
		},
		mouseleave:function(){
			$(this).find('ul').slideUp();
		}
	});

})