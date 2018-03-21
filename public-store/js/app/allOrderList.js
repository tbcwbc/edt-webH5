var app = {
  page: 1,
  userInfo: wechatapi.getUserInfo(),
  // 初始化
  init: function() {
    app.getOrderList();
    app.initScroll();
    $('.hock-footer>li').on('click', wechatapi.footerGoto);
  },

  getOrderList: function() {
    var data = {
      id: app.page,
      pageSize: 10,
      memberId: app.userInfo.id,
      //    memberId: 111,
      orderId: 0,
      status: 0, //订单类型  0 全部 
      channel: CNANNEL
    }

    wechatapi.loadingBox();
    wechat.post_data(API.gateway + API.orderList, data, function(response) {
      wechatapi.closeLoading();
      console.log(response);
      if(response.code == ERR_OK) {
        app.setOptions(response.data);
      }

    });
  },
  // 订单详情页面
  gotoOrderDetails: function(orderNum,e) {
  	e.stopPropagation();
    window.location.href = "orderInfo.html?cId="+cId+"&orderNum="+orderNum;
  },
// 更改订单状态
  updateOrderStatus: function(id,status,e) {
  	e.stopPropagation();
    wechat.get_data(API.gateway + API.updateOrderStatus + id + "/" + status, function(response) {
      console.log(response);
      app.page == 0;
      if(status == 4){
      	wechatapi.prompt('订单取消成功');
      }
      app.getOrderList();
    });
  },
  setOptions: function(list) {

    if(app.page == 1) {
      $("#wrapper").empty();
    }
    $.views.helpers({
      fmoney: function(price) {
        return(price / 100).toFixed(2);
      }
    });
    var html = $('#jsr').render(list);
    $("#wrapper").append(html);

  },
  initScroll: function() {
    var listWrapper = document.querySelector('.order-list-hook'),
      listContent = document.querySelector('.list-content-hook'),
      topTip = document.querySelector('.refresh-hook'),
      bottomTip = document.querySelector('.loading-hook');
    if(listWrapper.clientHeight > listContent.clientHeight) {
      bottomTip.style.display = 'none';
    }
    var scroll = new window.BScroll(listWrapper, {
      probeType: 3,
      click: true
    });
    // 滑动中
    scroll.on('scroll', function(position) {
      if(position.y > 30) {
        topTip.innerText = '释放立即刷新';
      }
    });
    /*
     * @ touchend:滑动结束的状态
     * @ maxScrollY:屏幕最大滚动高度
     */
    // 滑动结束
    scroll.on('touchend', function(position) {
      if(position.y > 30) {
        setTimeout(function() {
          /*
           * 下拉刷新，请求第一页数据
           */
          app.page = 1;
          app.getOrderList();
          // 恢复文本值
          topTip.innerText = '下拉刷新';
          // 刷新列表后,重新计算滚动区域高度
          scroll.refresh();
        }, 1000);
      } else if(position.y < (this.maxScrollY - 30)) {
        app.page++;
        bottomTip.innerText = '加载中...';
        setTimeout(function() {
          // 恢复文本值 
          bottomTip.innerText = '查看更多';
          app.page = $('.list-content-hook>li:last-child')[0].id;
          // 向列表添加数据
          app.getOrderList();
          // 加载更多后,重新计算滚动区域高度
          scroll.refresh();
        }, 1000);
      }
    });
  }

}

app.init();