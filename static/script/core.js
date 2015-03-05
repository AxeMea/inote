$(function(){

	// iNote
	iNote = {
		setting:{
			page:'.content'
		},

		init:function(){

			this._bind();

		},

		_bind:function(){
			var $page = $(this.setting.page),
				me = this;

			$page.on('click',function(){
				console.log(window.getSelection());
				console.log(me.getSelectText());
			});

		},

		getSelectText:function(){
			var txt = '';

			if(window.getSelection){
			    txt =  window.getSelection() + '';
			  }else if(document.selection){
		    	txt =  document.selection.createRange().text  + '';
	        	}

	        return txt;
		}
	};

	iNote.init();

})