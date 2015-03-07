$(function(){

	// iNote
	iNote = {
		setting:{
			page:'.content',
			mark:'mark-red',
			oldMark:'mark-red',
			tools:'.tool-bar',
			noteDlg:'note-dlg',
		},

		init:function(){

			this._bind();

		},

		_currentTag:'',

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
			var i = 0,
				pencils = $(this.setting.tools).find('span');

			for(i = 0 ; i < pencils.length;i++){
				tag.removeClass($(pencils[i]).attr('data-pclass'));
			}
		},

		_changeMark:function(tag){

			this._removeAllMarkStyle(tag);
			tag.addClass(this.setting.mark);
			tag.attr('data-pclass',this.setting.mark);
			this._currentTag = '';
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

					html = '<span " id="' + uid + ' data-pclass="' +  me.setting.mark + '" class="tag ' + 'mark ' + me.setting.mark + '" id="' + uid + '">' + text + '</span>';

					if(textAfter)
						   html += '<span class="tag">' + textAfter + '</span>';

					tag.get(0).outerHTML = html;
					// me._setFocus($('#' + uid));
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
			}
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
			tag.removeAttr('id');
			tag.removeAttr('data-pclass');
			this._removeAllMarkStyle(tag);


			this._setTool(this.setting.oldMark);
			this._clearFocus(tag);
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

		_bind:function(){
			var $page = $(this.setting.page),
				me = this;

			
			var pencil = '';

			$page.on('click',function(){
			});

			// 保存笔记
			$('#saveNoteBtn').on('click',function(){
				if(me._currentTag){
					me._currentTag.attr('data-note',$('.note-dlg .note').val());
				}
			});


			// 点击tag
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
					me._showNoteDlg(me._currentTag,event.pageX,event.pageY);
				}
				else
					me._setTool(me.setting.mark);

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
					me.setting.oldMark = 'mark-red';

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

})