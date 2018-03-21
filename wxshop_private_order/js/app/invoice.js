var app = {
    list: [],
    Dialog: $("#Dialog"),
    loadingToast: $('#loadingToast'),
    fromPage: localStorage.getItem('fromPage'),
    selectId: "",
    // 初始化
    init: function () {

        app.getInvoiceList();

        $("#ok").on('click', app.ok);
        $("#no").on('click', app.no);

    },

    getInvoiceList: function () {

        var info = JSON.parse(localStorage.getItem('USERINFO'));

        wechat.get_data(API.gateway + API.invoiceList + info.id, function (response) {
            var code = response.code;
            console.log(response);
            if (code == 100000) {
                app.setCompanyOptions(response.data);
            }
        });

    },

    setCompanyOptions: function (list) {

        $(".content-wrapper").empty();

        $.each(list, function (index, item) {
            if (item.type == 1) {
                var ul = $("<ul  class='invoice-info border-bottom-1px company' onclick='app.selectInvoice("+item.id+")'>");
                var name = $("<li class='item'><em class='title'>抬头:</em><span class='text'>" + item.companyName + "</span><span class='type'>普通增值税发票</span></li>");
//              var phone = $("<li class='item'><em class='title'>联系电话:</em><span class='text'>" + item.phone + "</span></li>");
                var taxNumber = $("<li class='item'><em class='title'>税号:</em><span class='text'>" + item.taxNumber + "</span></li>");
//              var bankName = $("<li class='item'><em class='title'>开户行:</em><span class='text'>" + item.bankName + "</span></li>");
//              var bankAccount = $("<li class='item'><em class='title'>账号:</em><span class='text'>" + item.bankAccount + "</span></li>");
                var status = $("<div class='setDefault'><label><input type='radio' name='default' value='" + item.isDefault + "' class='input-none' /><i class='is-check'></i>设为默认</label></div>");
                var radio = $("<li class='item border-bottom-1px'></li>");
                radio.append(status);
                var edit = $("<a>编辑</a>");
                var de = $("<a style='margin-left:10px'>删除</a>");
                var change = $("<div class='default'></div>");
                change.append(edit);
                change.append(de);

                ul.append(name);
//              ul.append(phone);
                ul.append(taxNumber);
//              ul.append(bankName);
//              ul.append(bankAccount);
//              var timg = $("<li ></li>");
//              if (item.pictureList) {
//                  $.each(item.pictureList, function (index, data) {
//                      var image = $("<img src='" + data.pictureUrl + "' class='invoiceImg' />");
//                      timg.append(image);
//                  })
//              }
//              ul.append(timg);
                ul.append(radio);
                ul.append(change);
                $(".content-wrapper").append(ul);

                $('input:radio[value=1]').attr('checked', 'true');

                // 默认
                status.children('label').on('click', function (e) {
                	e.stopPropagation();
                    app.changeDefault(item);
                });

                //编辑
                edit.on('click', function(e){
                	e.stopPropagation();
                   window.location.href = "editInvoice.html?id="+item.id+"&cId="+cId;
                })

                // 删除
                de.on('click', function (e) {
                	e.stopPropagation();
                    app.selectId = item.id;
                    app.Dialog.fadeIn();
                })

            } else {
                var ul = $("<ul  class='invoice-info border-bottom-1px person' onclick='app.selectInvoice("+item.id+")'>");

                var title = $("<div class='item'>" +
                    "<em class='title'>抬头:</em><span class='text'>" + item.companyName + "</span><span class='type'>个人发票</span></div>");

                var status = $("<div class='setDefault'><label><input type='radio' value='" + item.isDefault + "' name='default' class='input-none' /><i class='is-check'></i>设为默认</label></div>");

                var edit = $("<a>编辑</a>");
                var de = $("<a style='margin-left:10px'>删除</a>");
                var change = $("<div class='default' style='margin-top:10px'></div>");
                change.append(edit);
                change.append(de);
                ul.append(title);
                ul.append(status);
                ul.append(change);
                $(".content-wrapper").append(ul);

                $('input:radio[value=1]').attr('checked', 'true');

                status.children('label').on('click', function (e) {
                	e.stopPropagation();
                    app.changeDefault(item,e);
                });

                //编辑
                edit.on('click', function(e){
                	e.stopPropagation();
                    window.location.href = "editInvoice.html?id="+item.id+"&cId="+cId;
                 })

                de.on('click', function (e) {
                	e.stopPropagation();
                    app.selectId = item.id;
                    app.Dialog.fadeIn();
                })

            }



        })

    },

    changeDefault: function (item,e) {
        app.loadingToast.fadeIn();
        wechat.post_data(API.gateway + API.defaultInvoice, {
            'id': item.id,
            'memberId': item.memberId
        }, function (response) {
            var code = response.code;
            app.loadingToast.fadeOut();
            console.log(response);
            if (code == 100000) {
                app.getInvoiceList();
            }else{
            	e.target.checked = false;
            }
        });

    },

    ok: function () {
        app.Dialog.fadeOut();
        app.loadingToast.fadeIn();
        wechat.get_data(API.gateway + API.deleteInvoice + app.selectId, function (response) {
            var code = response.code;
            app.loadingToast.fadeOut();
            console.log(response);
            if (code == 100000) {
            	var INVOICEID = localStorage.getItem('INVOICEID');
            	if(INVOICEID==app.selectId){
            		localStorage.removeItem('INVOICEID');
            	}
                app.getInvoiceList();
            }
        });

    },

    no: function () {
        app.Dialog.fadeOut();
    },
    // 选择发票
    selectInvoice:function(id){
    	if(app.fromPage){
    		localStorage.setItem('INVOICEID',id);
    		window.location.href = app.fromPage+".html?cId="+cId;
    	}
    }



}


app.init();