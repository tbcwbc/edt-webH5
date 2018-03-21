var app = {
  productId: wechat.get_url_param('productId'),
  userInfo: wechatapi.getUserInfo(),
  selectOrder: [],
  limit: {},
  init: function() {
    app.getGoodDetails();
    wechatapi.showShopCartCounts();
    localStorage.removeItem('ADDRESSID');
    localStorage.removeItem('INVOICEID');
    $('.add-hook').on('click', app.add);
    $(".pay-hook").on('click', app.pay);
    $(".cart-hook").on('click', app.gotoShopCart);
    $(".home-hook").on('click', function() {
      window.location.href = 'brand.html?cId=' + cId;
    });
  },
  gotoShopCart: function() {
    window.location.href = "shopCart.html?cId=" + cId;
  },
  pay: function() {
    if(app.limit.isLimit == 1) {
      if(app.limit.limitCounts != 0) {
        wechatapi.prompt("该商品每人限购" + app.limit.limitCounts + "件");
      } else {
        wechatapi.prompt("该商品需订单中非限购商品满" + wechatapi.priceFormat(app.limit.limitMoney) + "元才能购买");
      }
    };
    setTimeout(function() {
      //存储提交的订单id
      localStorage.setItem('selectOrder', JSON.stringify(app.selectOrder));
      window.location.href = "orderCommit.html?cId=" + cId;
    }, 500);
  },
  //商品详情
  getGoodDetails: function() {
  	var employeeId = app.userInfo.employeeId?app.userInfo.employeeId:1
    wechat.get_data(API.gateway + API.productInfoPrivate + app.productId+"/"+employeeId, function(response) {
      console.log(response);
      if(response.code == ERR_OK) {
        app.filldata(response.data);
      }
    })
  },
  //填充数据
  filldata: function(data) {
    //图片显示
    var picHtml = "";
    data.productPictureList.forEach(function(picObj) {
      picHtml += "<div class='swiper-slide'><img  src='" + picObj.url + "' alt=''/></div>";
    });
    $(".swiper-wrapper-hook").append(picHtml);

    $("#name").text(data.productSimplifyName);
    $("#price").text('￥' + (data.productMemberPrice / 100).toFixed(2));
    $("#stock").text(data.saleStock);

    $(".productDetail").html(data.productDetail);
    app.selectOrder.push({
      "productId": data.id,
      "intMoney": data.productMemberPrice,
      "counts": 1
    });
    app.limit = {
      "isLimit": data.isLimit, //是否是限制购买商品
      "limitCounts": data.limitCounts // 限制购买数量
    };
  },
  //加入购物车
  add: function() {

    var param = {
      memberId: app.userInfo.id, //用户id  
      productId: app.productId, //商品id   1
      counts: 1, //数量
      channel: CNANNEL //渠道
    };
    wechat.post_data(API.gateway + API.addGood, param, function(response) {
      if(response.code == ERR_OK) {
        wechatapi.showShopCartCounts();
        if(app.limit.isLimit == 1) {
          if(app.limit.limitCounts != 0) {
            wechatapi.prompt("成功加入购物车、该商品每人限购" + app.limit.limitCounts + "件");
          } else {
            wechatapi.prompt("成功加入购物车、该商品需订单中非限购商品满" + wechatapi.priceFormat(app.limit.limitMoney) + "元才能购买");
          }
        } else {
          wechatapi.prompt("成功加入购物车");
        };
      }else{
      	wechatapi.prompt(response.msg);
      }
    });

  }
}
app.init();