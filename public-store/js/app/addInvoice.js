var app = {

  memberId: "",
  //  picList:[],

  //  UID:"",

  // 初始化
  init: function() {

    app.getUserInfo();

    $('.btn-sub').on('click', app.save);

    //      $("#add").on('change', app.preview);

    // $('.add-file').on('click', app.chooseImage);
  },

  // 获取用户信息
  getUserInfo: function() {
    var info = JSON.parse(localStorage.getItem('USERINFO'));
    if(info) {
      app.memberId = info.id;
    }

  },

  save: function() {

    var name;
    //      var phone = $("#phone").val();
    var taxNumber = $("#taxNumber").val();
    var value = $('input[name="de"]:checked').val();
    var type = $('input[name="type"]:checked').val();
    //      var bankName = $("#bankName").val();
    //      var bankAccount = $("#bankAccount").val();

    if(value) {} else {
      value = "2";
    }

    if(type == 1) {
      name = $("#companyName").val();
    } else {
      name = $("#name").val();
    }

    if(wechatapi.check.isEmpty(name)) {
      wechatapi.prompt("发票抬头不能为空");
    } else if(type == 1 && wechatapi.check.isEmpty(taxNumber)) {
      wechatapi.prompt("税号信息不能为空");
    } else {
      var data = {
        memberId: app.memberId,
        type: type,
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
    wechat.post_data(API.gateway + API.createInvoice, data, function(response) {
    	wechatapi.closeLoading();
      var code = response.code;
      console.log(response);
      if(code == 100000) {
        window.location.href = "invoice.html?cId=" + cId;
      } else {
        wechatapi.prompt(response.msg);
      }
    });
  },

  chooseImage: function() {

    wechat.chooseImage(function(imgId) {
      wechatapi.prompt(imgId);
    });
  },

  preview: function(event) {

    var xhr;
    var fileObj = event.target.files[0];
    var url = API.gateway + "/product/productInfo/upload";
    // if(fileObj){
    //     var form = new FormData(); // FormData 对象
    //     form.append("file", fileObj); // 文件对象
    //     xhr = new XMLHttpRequest();  // XMLHttpRequest 对象

    //     xhr.open("post", url, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
    //     // xhr.setRequestHeader("Content-Type","application/json; charset=utf-8");
    //     // xhr.responseType = 'json';
    //     xhr.onload = app.uploadComplete; //请求完成
    //     // xhr.onerror =  uploadFailed; //请求失败
    //     xhr.send(form); //开始上传，发送form数据

    // }

    if(fileObj) {
      var form = new FormData(); // FormData 对象
      form.append("file", fileObj); // 文件对象
      $.ajax({
        url: url,
        type: "post",
        data: form,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: app.uploadComplete
      });

    }

  },

  uploadComplete: function(data) {
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