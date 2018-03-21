var app = {

  memberId: "",
  //      picList:[],
  ID: "",

  type: "",

  // 初始化
  init: function() {

    app.getUserInfo();

    $('.btn-sub').on('click', app.save);

    //          $("#add").on('change', app.preview);

    // $('.add-file').on('click', app.chooseImage);
  },

  // 获取用户信息
  getUserInfo: function() {
    var info = JSON.parse(localStorage.getItem('USERINFO'));
    if(info) {
      app.memberId = info.id;
    }
    app.ID = wechat.get_url_param('id');

    wechat.get_data(API.gateway + API.invoiceInfo + app.ID, function(response) {
      var code = response.code;
      console.log(response);
      if(code == 100000) {
        var info = response.data;
        app.type = info.type;

        if(info.type == 1) {

          $("#invoiceType").html("普通增值税发票");
          $('.tab-content>section').addClass('hide');
          $('.company').removeClass('hide');
          $("#companyName").val(info.companyName);
          //                      $("#phone").val(info.phone);
          $("#taxNumber").val(info.taxNumber);

          // var value = $('input[name="de"]:checked').val();
          // var type = $('input[name="type"]:checked').val();
          // var bankName = $("#bankName").val(info.bankName);
          // $("#bankAccount").val(info.bankAccount);

          if(info.isDefault == 1) {
            $("#cCheck").attr('checked', true);
          }
          // 公司营业执照图片显示
          //                      if(info.pictureList){
          //                         $.each(info.pictureList, function(index, data){
          //                             app.picList.push(data.pictureUrl);
          //                         })
          //                         app.setImg(app.picList);
          //  
          //                      }

        } else if(info.type == 2) {

          $("#invoiceType").html("个人发票");
          $('.tab-content>section').addClass('hide');
          $('.person').removeClass('hide');
          $("#name").val(info.companyName);
          if(info.isDefault == 1) {
            $("#pCheck").attr('checked', true);
          }
        }

      }
    });

  },

  save: function() {

    var name;
    //var phone = $("#phone").val();
    var taxNumber = $("#taxNumber").val();
    var value = $('input[name="de"]:checked').val();
    //var bankName = $("#bankName").val();
    //var bankAccount = $("#bankAccount").val();

    if(value) {} else {
      value = "2";
    }

    if(app.type == 1) {
      name = $("#companyName").val();
    } else {
      name = $("#name").val();
    }

    if(wechatapi.check.isEmpty(name)) {
      wechatapi.prompt("发票抬头不能为空");
    } else if(app.type == 1 && wechatapi.check.isEmpty(taxNumber)) {
      wechatapi.prompt("税号信息不能为空");
    } else {
      var data = {
        id: app.ID,
        memberId: app.memberId,
        type: app.type,
        companyName: name,
        phone: "",
        taxNumber: taxNumber,
        bankName: "",
        bankAccount: "",
        urlList: [],
        isDefault: value
      }
      app.startSave(data);
    }

  },

  startSave: function(data) {
    wechatapi.loadingBox();
    wechat.post_data(API.gateway + API.updateInvoice, data, function(response) {
      wechatapi.closeLoading();
      var code = response.code;
      console.log(response);
      if(code == 100000) {
        window.location.href = "invoice.html?cId=" + cId;
      } else {
        alert(response.msg);
      }
    });
  },

  chooseImage: function() {

    wechat.chooseImage(function(imgId) {
      alert(imgId);
    });
  },

  preview: function(event) {

    var xhr;
    var fileObj = event.target.files[0];
    var url = API.gateway + "/product/productInfo/upload";
    if(fileObj) {
      var form = new FormData(); // FormData 对象
      form.append("file", fileObj); // 文件对象
      xhr = new XMLHttpRequest(); // XMLHttpRequest 对象
      xhr.open("post", url, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
      // xhr.setRequestHeader('X-Security-Token', app.UID);
      xhr.onload = app.uploadComplete; //请求完成
      // xhr.onerror =  uploadFailed; //请求失败
      xhr.send(form); //开始上传，发送form数据

    }

  },

  uploadComplete: function(evt) {
    var data = JSON.parse(evt.target.responseText);

    if(data.code == 100000) {
      $("#img").attr("src", data.data);
      app.picList.push(data.data);

      app.setImg(app.picList);

    }

  },
  setImg: function(list) {
    $("#imgBox").empty();
    $.each(list, function(index, data) {
      var imgItem = $("<div class='imgItem'></div>");
      var dele = $("<div class='img_delete'>X</div>");
      var img = $("<img class='addImg' src='" + data + "'>");

      imgItem.append(img);
      imgItem.append(dele);
      $("#imgBox").append(imgItem);

      dele.on('click', function() {
        app.picList.splice(index, 1);
        app.setImg(app.picList);

      })
    })
  }

}

app.init();