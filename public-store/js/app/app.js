var categoryTwoId = wechat.get_url_param("categoryTwoId");
var searchKey = decodeURI(wechat.get_url_param("searchKey"));
var app = {
  page: 1,
  userInfo: wechatapi.getUserInfo(),
  // 初始化
  init: function() {
    app.initScroll();
    wechatapi.showShopCartCounts();
    $(".hock-footer>li").on('click', wechatapi.footerGoto);
    $(".classify-hook").on('click', function() {
      window.location.href = "productCategory.html?cId=" + cId;
    });
    $(".search-bar-hook").on('input', function() {
      searchKey = $(".search-bar-hook").val();
      app.page = 1;
      app.getProductList();
    });
    app.getProductList();
  },
  // 获取商品列表
  getProductList: function() {
    if(searchKey == "null") {
      searchKey = "";
    }
    var param = {
      "companyId": cId, //公司id
      "page": app.page,
      "searchKey": searchKey ? searchKey : "", //关键字搜索
      "pageSize": 10,
      "isOnShelf": 1, //上架状态 传1即可
      "categoryOneId": CATEGORYID,
      "categoryTwoId": categoryTwoId ? categoryTwoId : "" //系列id
    };
    console.log(param);
    wechat.post_data(API.gateway + API.productList, param, function(response) {
      console.log(response);
      if(response.code == ERR_OK) {
        app.fillData(response.data);
        if(response.data.data.length<=0){
        	if(app.page == 1){
        		$(".bottom-tip").addClass('hide');
        	}else{
        		$(".bottom-tip").removeClass('hide').find('.loading-hook').html('暂无数据');
        	}
        }else{
        	$(".bottom-tip").removeClass('hide').find('.loading-hook').html('查看更多');
        }
        app.page++;
      }
    });
  },

  detail: function(id) {
    window.location.href = "goodDetails.html?productId=" + id + "&cId=" + cId;
  },
  addShopCart: function(id, isLimit, limitCounts, limitMoney) {
    var param = {
      memberId: app.userInfo.id, //用户id  
      productId: id, //商品id   1
      counts: 1, //数量
      channel: CNANNEL //渠道
    };
    add();

    function add() {
      wechat.post_data(API.gateway + API.addGood, param, function(response) {
        if(response.code == ERR_OK) {
          // 判断是否为限购商品
          if(isLimit == 1) {
            if(limitCounts != 0) {
              wechatapi.prompt("成功加入购物车，该商品每人限购" + limitCounts + "件");
            } else {
              wechatapi.prompt("成功加入购物车，该商品需订单中非限购商品满" + wechatapi.priceFormat(limitMoney) + "元才能购买");
            }
          } else {
            wechatapi.prompt('商品已加入购物车');
          }
          wechatapi.showShopCartCounts();
        }else{
        	wechatapi.prompt(response.msg);
        }
      });
    }

  },
  fillData: function(data) {
    if(app.page == 1) {
      $("#wrapper").empty();
    }
    $.views.helpers({
      fmoney: function(price) {
        return(price / 100).toFixed(2);
      }
    });
    var html = $('#jsr').render(data);

    //if(app.page == 1 || !(wechatapi.check.isEmpty(searchKey))) {
    //    $("#wrapper").empty();
    //  } else 
    //  if((app.page == 1 && data.data.length < 0)||(app.page == 1 && !wechatapi.check.isEmpty(searchKey))) {
    //    $("#wrapper").empty();
    //    html = "<div class='no-good'>当前暂无搜索结果</div>";
    //    $(".list-wrapper-hook").append()
    //  }
    $("#wrapper").append(html);
    app.scroll.refresh();
    
  },
  initScroll: function() {
    var listWrapper = document.querySelector('.list-wrapper-hook'),
      listContent = document.querySelector('.list-content-hook'),
      topTip = document.querySelector('.refresh-hook'),
      bottomTip = document.querySelector('.loading-hook');
    //  if(listWrapper.clientHeight > listContent.clientHeight) {
    //    bottomTip.style.display = 'none';
    //  }
    app.scroll = new window.BScroll(listWrapper, {
      probeType: 3,
      click: true
    });
    // 滑动中
    app.scroll.on('scroll', function(position) {
      if(position.y > 30) {
        topTip.innerText = '释放立即刷新';
      }
    });
    /*
     * @ touchend:滑动结束的状态
     * @ maxScrollY:屏幕最大滚动高度
     */
    // 滑动结束
    app.scroll.on('touchend', function(position) {
    	$(".search-bar-hook").blur();
      if(position.y > 30) {
        setTimeout(function() {
          /*
           * 下拉刷新，请求第一页数据
           */
          app.page = 1;
          app.getProductList();
          // 恢复文本值
          topTip.innerText = '下拉刷新';
          // 刷新列表后,重新计算滚动区域高度
          app.scroll.refresh();
          $(".search-bar-hook").val("");
          searchKey = "";
        }, 1000);
      } else if(position.y < (this.maxScrollY - 30)) {
        bottomTip.innerText = '加载中...';
        setTimeout(function() {
          // 恢复文本值 
          bottomTip.innerText = '查看更多';
          // 向列表添加数据
          categoryTwoId = wechat.get_url_param("categoryTwoId");
          app.getProductList();
          // 加载更多后,重新计算滚动区域高度
          app.scroll.refresh();
        }, 1000);
      }
    });
  }
}

app.init();