var app = {
  orderNum: wechat.get_url_param("orderNum"),
  orderId: 0,
  productDetailList: [],
  status: 1, //1 待支付 2 已支付 3 支付失败 4 已取消 5已退款 6 待发货 7 待收货 8已完成 9待退款
  totalAmount: 0,
//orderLogisticsId:,
  userInfo: wechatapi.getUserInfo(),
  init: function() {
  	app.getOrderInfo();

  },
  //确认收货
  receipt: function() {
    var status = 8;
    wechat.get_data(API.gateway + API.updateOrderStatus + app.orderId + "/" + status, function(response) {
      console.log(response);
      if(response.code == ERR_OK) {
        // 收货成功 返回订单列表
        window.location.href = "orderActivity.html?cId=" + cId;
      }
    });
  },
  // 根据订单编号查询订单
  getOrderInfo: function() {
    wechat.get_data(API.gateway + API.getOrderByOrderNum + app.orderNum, function(response) {
      console.log(response);
      if(response.code == ERR_OK) {
        app.status = response.data.status;
        app.orderId = response.data.id;
        app.productDetailList = response.data.productDetailList;
        app.orderClassification();
        //总金额
        app.totalAmount = response.data.orderMoney;
        // 商品详情
        app.showOrderInfo(response.data);
        // 订单失效倒计时
        app.computationTime(response.data.downTime);
        // 地址信息
        app.showAddress(response.data.address);
        // 发票信息
        if(response.data.orderInvoice) {
          // type 1 公司发票，2个人发票
          app.showInvoice(response.data.orderInvoice);

        };
        // 物流信息
        if(response.data.status == 7) {
          app.showOrderLogistics(response.data.orderLogistics);
        };
      }
    });
  },
  showOrderInfo: function(data) {
    var productCount = 0;
    data.details.forEach(function(obj) {
      productCount += obj.productNum;
    });
    // 金额转换
    $.views.helpers({
      fmoney: function(price) {
        return(price / 100).toFixed(2);
      }
    });
    // 下订单客户信息
    $(".buyer-name").text(data.buyerName);
    $(".buyer-orderId").text(app.orderNum);
    $(".buyer-phone").text(data.buyerPhone);

    // 金额和订单数量 备注
    $("#counts").text(productCount);
    $(".priceSum").text((data.discountAmount / 100).toFixed(2));
    $("#remark").text(data.remark);

    var html = $("#jsr").render(data.details);
    $(".goods-hook").append(html);
  },
  showInvoice: function(data) {
    $(".invoice").removeClass('hide');
    $("#companyName").text(data.title);
    // 1 公司发票
    if(data.type == 1) {
      $(".invoice-info-hook>li").removeClass('hide');
      $("#taxNumber").text(data.dutyNumber);
      //			$("#bankAccount").text(data.bankAccount);
      //			$("#companyPhone").text(data.phone);
    }

  },
  showAddress: function(data) {
    $("#receivingName").text(data.name);
    $("#receivingPhone").text(data.tel);
    $("#address").text(data.province + data.city + data.area + data.detail);
  },
  // 物流信息
  showOrderLogistics: function(data) {
  	var html = '';
    data.forEach(function(obj) {
//  	app.orderLogisticsId.push(obj.id);
    	html+="<div class='logistics border-bottom-1px' onclick='queryOrderLogistics("+obj.id+")'>";
    	html+="<div class='logistics-fl'><div class='logistics-img'><img src='../images/prcoduct.png' /></div></div>";
      html+="<div class='logistics-info'><p class='col-6'>物流公司<span class='col-9 ml-1rem logistics-company-hook'>"+obj.companyName+"</span></p>";
      html+="<p class='col-9 logistics-info-text logistics-num-hook'>"+obj.logisticsNumber+"</p></div><div class='logistics-status'>运输中</div></div>";
    });
    $(".logisticsList-hook").append(html);
  },
  // 订单分类
  orderClassification: function() {
    if(app.status == 1) {
      $(".computationTime").removeClass('hide');
      app.computationTime();
      //每秒钟刷新一次
      $(".submit-hook").removeClass('hide').text('立即支付').on('click', function(e) {
        app.onlineOrder();
      });
    } else if(app.status == 7) {
      $(".submit-hook").removeClass('hide').text('确认收货').on('click', function(e) {
        app.receipt();
      });
    }
  },
  //  订单在24小时后失效，倒计时
  computationTime: function(createTime) {
    if(createTime == null || createTime == "") {
      return;
    }
    createTime = new Date(createTime);
    var setTime = 24 * 60 * 60 * 1000; //一天的毫秒数
    var nowTime,totalSecs,remainingSecs;
    var d,h,m,s;
    var i = setInterval(function() {
      nowTime = new Date();
      totalSecs = nowTime - createTime; //到现在相差的毫秒数
      remainingSecs = setTime - totalSecs;
      if(remainingSecs <= 0) {
        return;
      }
      d = parseInt(remainingSecs / 1000 / 60 / 60 / 24); //天
      h = parseInt(remainingSecs / 1000 / 60 / 60 % 24); //时
      m = parseInt(remainingSecs / 1000 / 60 % 60); // 分
      s = parseInt(remainingSecs / 1000 % 60); //秒

      var html = "";
      if(d != 0) {
        html += d + "天" + h + "小时" + m + "分钟" + s + "秒";
      } else if(h != 0) {
        html += h + "小时" + m + "分钟" + s + "秒";
      } else if(h == 0 && m != 0) {
        html += m + "分钟" + s + "秒";
      } else if(h == 0 && m == 0) {
        html += s + "秒";
        if(s <= 0) {
          $(".computationTime").addClass('hide');
          $(".submit-hook").removeClass('hide').text('订单已取消');
          clearInterval(i);

        }
      }
      $(".computationTime").html("该订单将在" + html + "后失效,请立即支付");
    }, 1000);
  },
  // 支付前 确认订单
  onlineOrder: function() {
    var param = {
      'canUseMemberPrice': 1, //可否使用会员价 1可以 0 不可以
      'orderMoney': app.totalAmount,
      'freight': 0, //运费 0
      'discount': 0, //优惠金额
      'memberPay': 0,
      'totalPay': app.totalAmount, //应付金额
      'productMoney': app.totalAmount, //商品金额
      'orderId': app.orderId,
      'productList': app.productDetailList
    };
    wechatapi.loadingBox();
    wechat.post_data(API.gateway + API.onlineOrder, param, function(response) {
      wechatapi.closeLoading();
      if(response.code == ERR_OK) {
        app.pay();
      } else {
        wechatapi.prompt(response.msg);
      }
    });
  },
  // 支付
  pay: function() {
    var param = {
      "companyId": cId,
      "memberId": app.userInfo.id,
      "orderNo": app.orderNum,
      "outOrderNo": "",
      "payOrderItems": [{
        "amount": app.totalAmount, //金额分
        "extendInfo": {
          "paymentType": "3",
          "openId": app.userInfo.openId
        },
        "paymentType": "wechat",
        "className": "",
        "deviceEn": "",
        "packageName": "",
        "paymentTypeId": 5
      }],
      "storeId": 99999, // 门店99999
      "totalAmount": app.totalAmount, // 金额分
      "type": 1,
      "version": 2  //1 publicStore付款  2 privateStore   3 app销售下单   4 app端活动下单
    };
    // 支付接口
    wechat.post_data(API.gateway + API.orderPay, param, function(response) {
      if(response.code == ERR_OK) {
        localStorage.setItem('wxData', JSON.stringify(response.data));
        app.wexinPayApi();
      } else {
      	wechatapi.prompt(response.msg);
      }
    });
  },
  wexinPayApi: function() {
    if(typeof WeixinJSBridge == "undefined") {
      if(document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', app.onBridgeReady, false);
      } else if(document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', app.onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', app.onBridgeReady);
      }
    } else {
      app.onBridgeReady();
    }
  },
  onBridgeReady: function() {
    var wxParam = JSON.parse(localStorage.getItem('wxData'));
    WeixinJSBridge.invoke(
      'getBrandWCPayRequest', {
        "appId": wxParam.wxMap.appId, //公众号名称，由商户传入     
        "timeStamp": wxParam.wxMap.timeStamp, //时间戳，自1970年以来的秒数     
        "nonceStr": wxParam.wxMap.nonceStr, //随机串     
        "package": wxParam.wxMap.package,
        "signType": wxParam.wxMap.signType, //微信签名方式：     
        "paySign": wxParam.wxMap.paySign //微信签名 
      },
      function(res) {
        if(res.err_msg == "get_brand_wcpay_request:ok") {
          window.location.href = "orderActivity.html?cId=" + cId;
        } // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
      }
    );
  }
};
app.init();

     // 点击查询物流信息
    function queryOrderLogistics(id) {
//  	localStorage.setItem('orderLogisticsId',JSON.stringify(app.orderLogisticsId));
      window.location.href = "orderLogistics.html?cId=" + cId+"&orderLogisticsId="+id;
    };