var app = {
	fromPage: localStorage.getItem('fromPage'),
    list:[],
    info:{},
    Dialog: $("#Dialog"),
    loadingToast: $('#loadingToast'),
    selectId:"",
    // 初始化
    init: function(){   
     
        app.info = JSON.parse(localStorage.getItem('USERINFO'));
       
        app.getAddressList();

        $("#ok").on('click',app.ok);
        $("#no").on('click',app.no);
        $('.hock-addBtn').on('click', function () {
            window.location.href = "addAddress.html?cId="+cId;
        });
        
    },

    getAddressList: function(){
    	wechat.get_data(API.gateway+ API.addressList + app.info.id ,function (response) {
            var code = response.code;
            console.log(response);
            if(code == 100000){
               app.loadList(response.data);
            }   
        });
    },


    loadList: function(list){
        $('.lists').empty();
        $.each(list,function(index,item){
            var name = $("<div class='item-info'>"+
            "<span class='text>收件人:</span>"+
            "<span class='user'>"+item.name+"</span>"+
            "<span class='tell'>"+item.phone+"</span></div>");

            var address = $("<div class='item-desc'>地址信息:<span class='address'>"+item.provinceName + item.cityName + item.districtName+item.address+"</span></div>");

            var li = $("<li class='item border-bottom-1px' onclick='app.selectAddress("+item.id+")'></li>");


            var status = $("<div class='default'><label><input type='radio' name='default' value='"+item.isDefault+"' exid='" + item.id +"' class='input-none'/><i class='is-check'></i>设为默认</label></div>");

            var edit = $("<a>编辑</a>"); 

            var de = $("<a style='margin-left:10px'>删除</a>");

            var change = $("<div class='default'></div>");

            change.append(edit);

            change.append(de);

            li.append(name);

            li.append(address);

            li.append(status);

            li.append(change);

            $('.lists').append(li);

            $('input:radio[value=1]').attr('checked', 'true');
            
            status.children('label').on('click', function(e){
            	e.stopPropagation();
                 app.changeDefault(item,e);                 
            });

            de.on('click', function(e){ 
            	e.stopPropagation();
                app.selectId = item.id;   
                app.Dialog.fadeIn();               
            })

            edit.on('click', function(e){ 
            	e.stopPropagation();
                window.location.href = "editAddress.html?id="+item.id+"&cId="+cId;           
           })
        
        })
    },

    changeDefault: function(item,e){
        app.loadingToast.fadeIn();
        wechat.post_data(API.gateway+ API.defaultAddress,{'id':item.id,'memberId':item.memberId} ,function (response) {
            var code = response.code;
            app.loadingToast.fadeOut();
            console.log(response);
            if(code == 100000){
               app.getAddressList();
            }else{
            	e.target.checked = false;
            }
        });

    },

    ok: function(){
        app.Dialog.fadeOut();
        app.loadingToast.fadeIn();
        wechat.get_data(API.gateway+ API.deleteAddress + app.selectId ,function (response) {
            var code = response.code;
            app.loadingToast.fadeOut();
            console.log(response);
            if(code == 100000){
            	var ADDRESSID = localStorage.getItem('ADDRESSID');
            	if(ADDRESSID==app.selectId){
            		localStorage.removeItem('ADDRESSID');
            	}
                app.getAddressList();
            }   
        });

    },

    no: function(){
        app.Dialog.fadeOut();
    },
    
    selectAddress: function(id){
    	if(app.fromPage){
    		localStorage.setItem('ADDRESSID',id);
    		window.location.href = app.fromPage+".html?cId="+cId;
    	}
    	
    }




  

}


app.init();