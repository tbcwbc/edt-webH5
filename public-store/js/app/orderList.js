var app = {
  status: 1,
  page: 0,
  userInfo: wechatapi.getUserInfo(),
  // 初始化
  init: function() {
    wechatapi.showShopCartCounts();
    app.getOrderList();
    app.initScroll();
    $('.hock-footer>li').on('click', wechatapi.footerGoto);
    $(".allOrder-hook").on('click', function() {
      window.location.href = "allOrderList.html?cId=" + cId;
    });
    $(".nav-ul li").click(function() {
      app.page = 0;
      $("#wrapper").empty();
      $(".nav-ul li").removeClass("active");
      $(this).addClass("active");
      var index = $(this).index();
      switch(index) {
        case 0:
          app.status = 1;
          break;
        case 1:
          app.status = 6;
          break;

        case 2:
          app.status = 7;
          break;
        case 3:
          app.status = 8;
          break;
        case 4:
          app.status = 4;
          break;
      }

      app.getOrderList();
      app.scroll.refresh();
      app.scroll.scrollTo(0, 0);
      // app.initScroll();

    });
  },
  // 订单详情页面
  gotoOrderDetails: function(orderNum, e) {
    e.stopPropagation();
    window.location.href = "orderInfo.html?cId=" + cId + "&orderNum=" + orderNum;
  },
  // 更改订单状态
  updateOrderStatus: function(id, status, e) {
    $('#loadingToast').fadeIn();
    if(!e._constructed) {
      return;
    };
    e.stopPropagation();
    wechat.get_data(API.gateway + API.updateOrderStatus + id + "/" + status, function(response) {
      console.log(response);
      $('#loadingToast').fadeOut();
      if(response.code == ERR_OK) {
        if(status == 4) {
          wechatapi.prompt('订单取消成功');
        }
        app.page == 0;
        app.getOrderList();
        app.scroll.refresh();
      }else{
      	wechatapi.prompt(response.msg);
      }
    });
  },
  getOrderList: function() {
    var data = {
      pageSize: 10,
      memberId: app.userInfo.id,
      status: app.status,
      orderId: app.page,
      channel: CNANNEL
    }

    console.log(data);
    $('#loadingToast').fadeIn();
    wechat.post_data(API.gateway + API.orderList, data, function(response) {
      var code = response.code;
      console.log(response);
      if(code == 100000) {
        $('#loadingToast').fadeOut();
        app.setOptions(response.data);
      }

    });
  },

  setOptions: function(list) {

    if(app.page == 0) {
      $("#wrapper").empty();
    }
    $.views.helpers({
      fmoney: function(price) {
        return(price / 100).toFixed(2);
      }
    });
    var html = $('#jsr').render(list);
    $("#wrapper").append(html);

    //  app.initScroll();

  },
  initScroll: function() {
    var listWrapper = document.querySelector('.order-list-hook'),
      listContent = document.querySelector('.list-content-hook'),
      topTip = document.querySelector('.refresh-hook'),
      bottomTip = document.querySelector('.loading-hook');
    if(listWrapper.clientHeight > listContent.clientHeight) {
      bottomTip.style.display = 'none';
    }
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
      if(position.y > 30) {
        setTimeout(function() {
          /*
           * 下拉刷新，请求第一页数据
           */
          app.page = 0;
          app.getOrderList();
          // 恢复文本值
          topTip.innerText = '下拉刷新';
          // 刷新列表后,重新计算滚动区域高度
          app.scroll.refresh();
        }, 1000);
      } else if(position.y < (this.maxScrollY - 30)) {
        bottomTip.innerText = '加载中...';
        setTimeout(function() {
          // 恢复文本值 
          bottomTip.innerText = '查看更多';
          app.page = $('.list-content-hook>li:last-child')[0].id;
          // 向列表添加数据
          app.getOrderList();
          // 加载更多后,重新计算滚动区域高度
          app.scroll.refresh();
        }, 1000);
      }
    });
  },

}

app.init();