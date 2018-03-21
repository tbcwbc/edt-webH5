const ERR_OK = 100000;
var CNANNEL = 5;  //渠道：1线下 2线上 3 app 4 publicStore 5 privateStore 
var wechatapi = (function() {
  return {
    /* 正则验证 */
    check: {
      isEmpty: function(obj) {
        if(obj == null || obj == undefined || ("" + obj) == "") {
          return true;
        }
        return false;
      },
      isPhone: function(str) {
        var regu = /^1[3-8][0-9]{9}$/;
        return regu.test(str);
      }
    },
    //金额格式化
    priceFormat:function(money){
    	return (money / 100).toFixed(2);
    },
    // 解析url参数
    //@example ?id=12345&a=b
    // @return Object {id:12345,a:b}
    urlParse: function() {
      var url = window.location.search;
      var obj = {};
      var reg = /[?&][^?&]+=[^?&]+/g;
      var arr = url.match(reg);
      if(arr) {
        arr.forEach(function(item) {
          var tempArr = item.substring(1).split("=");
          var key = decodeURIComponent(tempArr[0]);
          var value = decodeURIComponent(tempArr[1]);
          obj[key] = value;
        })
      }
      return obj;
    },
    getUserInfo: function() {
      return JSON.parse(localStorage.getItem('USERINFO'));
    },
    getShopCartCounts: function() {
      var counts = 0;
      var param = {
        //      "memberId": 111,
        "memberId": wechatapi.getUserInfo().id,
        "channel": CNANNEL //渠道
      };
      wechat.post_data(API.gateway + API.shopCartCounts, param, function(response) {
        counts = response.data;
        //      localStorage.setItem('shopCartCounts', response.data);
      });
      return counts;
    },
    showShopCartCounts: function() {
      var shopCartCounts = wechatapi.getShopCartCounts();
      if(shopCartCounts > 0) {
        $("#shopCartCounts").text(shopCartCounts).removeClass('hide');
      }
    },
    footerGoto: function() {
      var _this = $(this);
      if(_this.is('.shop')) {
        window.location.href = "brand.html?cId=" + cId;
      } else if(_this.is('.cart')) {
        window.location.href = "shopCart.html?cId=" + cId;
      } else if(_this.is(".order")) {
        window.location.href = "orderActivity.html?cId=" + cId;
      } else if(_this.is('.my')) {
        window.location.href = "my.html?cId=" + cId;
      }
    },
    //loading提示框
    loadingBox: function() {
      var load = $("<div class='mask' id='mask'></div><div id='loading' class='loading-box'></div>");
      load.appendTo(window.document.body);
      var stu = "<div class='loadEffect'>";
      stu += "<span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>";
      stu += "<div class='load-str'>正在加载...</div>";
      $("#loading").html(stu);
      setTimeout("wechatapi.closeLoading()", 30000);
    },
    closeLoading: function() {
      $("#loading").fadeOut();
      $("#mask").fadeOut();
      setTimeout("$('#loading').remove();$('#mask').remove();", 0);
    },
    // 提示框
    prompt: function(text) {
      $('#prompt').remove();
//    $("#mask").remove();
//    var mask = $("<div class='mask' id='mask'></div>");
      var prompt = $("<div class='prompt' id='prompt'>" + text + "</div>");
//    mask.appendTo(window.document.body);
      prompt.appendTo(window.document.body);
      setTimeout(function(){
      	$('#prompt').fadeOut();
//    	$("#mask").fadeOut();
//				setTimeout("$('#mask').remove();",0);
      	setTimeout("$('#prompt').remove();",0);
      }, 2200);
    },
    dialog: {
      confirm: function(text, callback) {
        var dialog = $("<div id='dialog' style='display: none;'></div>");
        var mask = $("<div class='weui-mask'></div>");
        var info = $("<div class='weui-dialog'></div>");
        var title = $("<div class='weui-dialog__bd'>"+text+"</div>");
        var btn = $("<div class='weui-dialog__ft'><a href='javascript:;' class='weui-dialog__btn col-3 ok-hook'>确定</a></div>");
        
        info.append(title);
        info.append(btn);
        dialog.append(mask);
        dialog.append(info);
        dialog.appendTo(window.document.body);
        dialog.fadeIn();
        btn.on('click',function(e){
        	$("#dialog").fadeOut();
        	setTimeout('$("#dialog").remove()',1000);
        	callback&&callback();
        });
      }
    }
  }
})();
/**
 * 时间格式化
 * @param {Object} fmt
 */
Date.prototype.Format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if(/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for(var k in o)
    if(new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  return fmt;
}