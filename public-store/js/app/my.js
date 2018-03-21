var app = {
  Dialog: $("#Dialog"),
  // 初始化
  init: function() {
    wechatapi.showShopCartCounts();
    $(".hock-footer>li").on('click', wechatapi.footerGoto);

    app.getUserInfo();

    $("#invoice").on('click', app.goInvoice);
    $("#address").on('click', app.goAddress);
    $("#user").on('click', app.goUser);
    $("#contact").on('click', app.showPop);
    $("#close").on('click', app.close_pop);
    $("#no,.weui-mask").on("click", app.no);
    $("#ok").on("click", app.ok);
    $(".close-hook").on('click', function() {
      WeixinJSBridge.call('closeWindow');
    });
  },

  // 获取用户信息
  getUserInfo: function() {
    var info = JSON.parse(localStorage.getItem('USERINFO'));
    console.log(info);
    wechat.get_data(API.gateway + API.memberInfo + info.id, function(response) {
      if(response.code == ERR_OK) {
        localStorage.setItem('USERINFO', JSON.stringify(response.data));
        $('#head').attr("src", response.data.headImage);
        $('#nikeName').html(response.data.wxNickname);
        if(wechatapi.check.isEmpty(response.data.tel)) {
          $('#tel').html('');
        } else {
          var tel = response.data.globalRoaming + response.data.tel;
          $('#tel').html(tel ? tel : "");
        }
      }
    });
  },




  showPop: function() {
    app.Dialog.show();
  },

  goInvoice: function() {
    window.location.href = "invoice.html?cId=" + cId;
  },
  goAddress: function() {
    window.location.href = "address.html?cId=" + cId;
  },

  goUser: function() {
    window.location.href = "userInfo.html?cId=" + cId;
  },

  no: function() {
    app.Dialog.hide();
  },
  ok: function() {
    app.Dialog.hide();

  }

}

app.init();