var selectOrder = JSON.parse(localStorage.getItem('selectOrder'));
var app = {
  invoiceInput: $("input[name='invoice']"),
  orderList: [],
  // 从地址编辑页面获取地址id
  addressId: localStorage.getItem('ADDRESSID'),
  // 从发票编辑页面获取地址id
  invoiceId: localStorage.getItem('INVOICEID'),
  userInfo: wechatapi.getUserInfo(),

  init: function() {
    app.invoiceInput.prop('checked', false);
    app.getOrderInfo();
    if(app.addressId) {
      app.getAddressById();
    } else {
      app.getDefaultAddress();
    }

    if(app.invoiceId) {
      app.getInvoiceById();
    }

    app.invoiceInput.on('click', function(e) {
      if(e.target.checked) {
        $(".invoice-info-hook").removeClass('hide');
        if(app.invoiceId) {
          app.getInvoiceById();
        } else {
          app.getDefaultInvoice();
        }
      } else {
        $(".invoice-info-hook").addClass('hide');
      }
    });
    $('.hock-submit').on('click', function(e) {
      e.disabled = true;
      app.submitOrder();
    });
    $('.hock-edit').on('click', function() {
      localStorage.setItem('fromPage', 'orderCommit');
      window.location.href = "invoice.html?cId=" + cId;
    })
    $('.editAddress-hook').on('click', function() {
      localStorage.setItem('fromPage', 'orderCommit');
      window.location.href = "address.html?cId=" + cId;
    });

  },
  //提交订单
  submitOrder: function() {
    if(app.check()) {
      console.log(app.param());
      wechat.post_data(API.gateway + API.submitOrder, app.param(), function(response) {
        $('.hock-submit').prop('disabled', false);
        console.log(response)
        if(response.code == ERR_OK) {
          //订单提交成功，删除本地 selectOrder ADDRESSID INVOICEID
          localStorage.removeItem('selectOrder');
          localStorage.removeItem('ADDRESSID');
          localStorage.removeItem('INVOICEID');

          wechatapi.getShopCartCounts();
          // response.data  订单编号
          // 跳转至订单列表
          window.location.href = "orderInfo.html?cId=" + cId + "&orderNum=" + response.data;

        } else {
          wechatapi.prompt(response.msg);
        }
      });
    }

  },
  // 获取商品信息
  getOrderInfo: function() {
    var productIds = [];
    selectOrder.forEach(function(obj) {
      productIds.push(obj.productId);
    });
    wechat.post_data(API.gateway + API.productInfoList, {
      "productIds": productIds
    }, function(response) {
      console.log(response);
      if(response.code == ERR_OK) {
        if(response.data.length > 0) {
          app.orderList = response.data;
          app.fillData();
        }
      }
    });
  },
  // 查询默认地址
  getDefaultAddress: function() {
    wechat.get_data(API.gateway + API.getDefaultAddress + app.userInfo.id, function(response) {
      console.log(response);
      if(response.code == ERR_OK) {
        if(response.data) {
          app.address = response.data;
          app.showAddress(response.data);
        }
      }
    });
  },
  //根据id查询地址
  getAddressById: function() {
    wechat.get_data(API.gateway + API.getAddressById + app.addressId, function(response) {
      console.log(response);
      if(response.code == ERR_OK) {
        localStorage.removeItem('fromPage');

        if(response.data) {
          app.address = response.data;
          app.showAddress(response.data);
        }
      }
    });
  },
  // 查询默认发票
  getDefaultInvoice: function() {
    wechat.get_data(API.gateway + API.getDefaultInvoice + app.userInfo.id, function(response) {
      console.log(response);
      if(response.code == ERR_OK) {
        if(response.data) {
          app.invoice = response.data;
          app.showInvoice(response.data);
        }
      }
    });
  },
  //根据id查询发票
  getInvoiceById: function() {
    wechat.get_data(API.gateway + API.getInvoiceById + app.invoiceId, function(response) {
      console.log(response);
      if(response.code == ERR_OK) {

        localStorage.removeItem('fromPage');

        if(response.data) {
          app.invoice = response.data;
          app.showInvoice(response.data);
        }
      }
    });
  },
  showInvoice: function(data) {
    $(".invoice-info-hook").removeClass('hide');
    app.invoiceInput.prop('checked', true);
    $("#companyName").text(data.companyName);
    // type 1 公司发票
    if(data.type == 1) {
      $(".invoice-info-hook>li").removeClass('hide');
      $("#taxNumber").text(data.taxNumber);
      //    $("#bankAccount").text(data.bankAccount);
      //    $("#companyPhone").text(data.phone);
    }

  },
  showAddress: function(data) {
    $("#buyerName").text(data.name);
    $("#buyerPhone").text(data.phone);
    $("#address").text(data.provinceName + data.cityName + data.districtName + data.address);
  },
  fillData: function() {
    // 给每个商品添加数量字段
    app.orderList.forEach(function(orderList) {
      selectOrder.forEach(function(order) {
        if(orderList.id == order.productId) {
          orderList['counts'] = order.counts;
        }
      });
    });
    // 金额转换
    $.views.helpers({
      fmoney: function(price) {
        return(price / 100).toFixed(2);
      }
    });
    var html = $("#jsr").render(app.orderList);
    $(".goods-hook").append(html);
    $("#counts").text(app.total().counts);
    $(".priceSum").text((app.total().priceSum / 100).toFixed(2));
  },
  // 合计
  total: function() {
    var priceSum = 0,
      counts = 0;
    selectOrder.forEach(function(good) {
      counts += good.counts;
      priceSum += good.intMoney * good.counts;
    })
    return {
      counts,
      priceSum
    };
  },
  check: function() {
    if(wechatapi.check.isEmpty(app.userInfo.tel)) {
      //    此用户为新用户，需填写用户信息
      wechatapi.dialog.confirm("烦请先登录，再进行下单", function() {
        window.location.href = 'register.html?cId=' + cId + '&fromPage=orderCommit';
      });
      return false;
    }
    if(wechatapi.check.isEmpty(app.address)) {
      wechatapi.prompt('地址信息不能为空');
      return false;
    };
    if(app.invoiceInput.is(':checked')) {
      if(wechatapi.check.isEmpty(app.invoice)) {
        wechatapi.prompt('发票信息不能为空');
        return false;
      };
    };
    if(!app.check_isLimit()) {
      return false;
    }
    return true;
  },
  // 被限制商品判断
  check_isLimit: function() {
    var isLimit = true;
    $.each(app.orderList, function(index, obj) {
      //判断是否为限制购买商品 isLimit：1
      if(obj.isLimit == 1) {
        // 购买商品数量大于限制购买数量
        if(obj.counts > obj.limitCounts) {
          wechatapi.prompt("抱歉您无法下单，" + obj.productSimplifyName + "每人限购" + obj.limitCounts + "件，请调整商品数量后重新下单");
          isLimit = false;
          return false;
        }
        if(obj.limitMoney != 0) {
          wechatapi.prompt("抱歉您无法下单，订单中非限购商品总金额满" + obj.limitMoney + "元时才能购买" + obj.productSimplifyName);
          isLimit = false;
          return false;
        }
      }
    });
    return isLimit;
  },
  // 参数对象
  param: function() {
    var buyerName = $("#buyerName").text();
    var buyerPhone = $("#buyerPhone").text();
    var remark = $("#remark").val();
    var productList = [];
    app.orderList.forEach(function(obj) {
      productList.push({
        "productId": obj.id,
        "num": obj.counts
      });
    });
    // 发票信息
    //  var invoiceId = null;
    //  if(app.invoiceInput.is(":checked")) {
    //    invoiceId = {
    //      "title": app.invoice.companyName, //抬头
    //      "dutyNumber": app.invoice.taxNumber, //税号
    //      "bankAccount": app.invoice.bankName, //开户行
    //      "accountNumber": app.invoice.bankAccount, //账号
    //      "pictureUrl": app.invoice.pictureList[0], //img
    //      "phone": app.invoice.phone, //电话
    //      "type": app.invoice.type //1 ==公司发票  2==个人发票
    //    }
    //  };

    //  购物车订单
    var shoppingCartList = [];
    selectOrder.forEach(function(obj) {
      if(obj.id) {
        shoppingCartList.push(obj.id);
      }
    });
    //测试
    const STOREID = 99999; //门店id 暂时固定

    var memberId = app.userInfo.id;
    var memberNo = app.userInfo.memberNumber;
    var openid = app.userInfo.openId;
    //      var memberId = 111; //会员id 
    //      var memberNo = 757; //会员编号
    //      var openid = localStorage.getItem('OPENID');

    //  var address = { //地址对象
    //    "companyId": cId,
    //    "storeId": STOREID,
    //    "openid": openid,
    //    "province": app.address.provinceName, //省
    //    "city": app.address.cityName, //市
    //    "area": app.address.districtName, //区
    //    "detail": app.address.address, //详细地址
    //    "tel": app.address.phone, //电话
    //    "provinceId": app.address.province, //省id
    //    "cityId": app.address.city, //市id
    //    "areaId": app.address.district, //区id
    //    "name": app.address.name //收货人姓名
    //  };

    var param = {
      "canUseMemberPrice": 0, //可否使用会员价 1可以 0 不可以
      "companyId": cId, //商户id
      "openid": openid, //微信 id
      "storeId": STOREID, //门店id
      "channel": CNANNEL, //渠道：1线下 2线上 3 app 4 publicStore 5 privateStore 
      "memberId": memberId, //会员id 
      "buyerName": app.userInfo.username, //购买人姓名
      "buyerPhone": app.userInfo.tel, //购买人电话
      "remark": remark, //备注信息
      "orderMoney": app.total().priceSum, //订单金额（分）
      "orderType": 0, //1销售下单 2客户下单
      "memberNo": memberNo, //会员编号
      "freight": 0, //运费 默认为0
      "type": 1, // 1消费 2充值
      "discount": 0, //优惠金额 默认0
      "memberPay": 0, //会员余额付款金额
      "totalPay": app.total().priceSum, //应付金额
      "productMoney": app.total().priceSum, //商品金额
      "activityId": 0, //活动id （0为非活动单）
      "productList": productList, //商品列表
      "addressId": app.address.id,
      "shoppingCartList": shoppingCartList, // 是否为购物车下单，是 则[id,id..],否则传[]
      "invoiceId": app.invoice ? app.invoice.id : null,
      "couponCodeList": [] //优惠券信息
    };
    return param;
  }

}
app.init();