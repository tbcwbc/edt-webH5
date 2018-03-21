var app = {
  init: function() {
    $(".search-btn-hook").on('click', app.getProductBysearchKey);
    $(".hock-footer>li").on('click', wechatapi.footerGoto);
    $(".classify-hook").on('click', function() {
      window.location.href = "productCategory.html?cId=" + cId;
    });
    wechat.init_auth(cId, wechat.get_url(), function() {
      wechatapi.showShopCartCounts();
      app.getCategoryList();
      app.initScroll();
      app.share();
    });

  },
  //关键字搜索
  getProductBysearchKey: function() {
    var searchKey = encodeURI(encodeURI($(".search-bar-hook").val()));
    window.location.href = "home.html?cId=" + cId + "&searchKey=" + searchKey;
  },
  // 获取分类详情
  getCategoryList: function() {
    wechatapi.loadingBox();
    var param = "?companyId=" + cId + "&store=public";
    // store=public   测试用store=all
    wechat.get_data(API.gateway + API.categoryList + param, function(response) {
      console.log(response);
      wechatapi.closeLoading();
      if(response.code == ERR_OK) {
        app.fillData(response.data);
      }
    });
  },
  // 跳转产品系列
  gotoHome: function(id) {
    window.location.href = 'home.html?categoryTwoId=' + id + '&cId=' + cId;
  },
  // 显示数据
  fillData: function(data) {
    var html = '';
    data.forEach(function(obj) {
      if(obj.id == CATEGORYID) {
        obj.productVo.forEach(function(productVoObj) {
          html += "<li onclick='app.gotoHome(" + productVoObj.id + ")'><img src='" + productVoObj.publicStoreImage + "'/></li>"
        });
      }
    });
    $(".list-content-hook").empty().append(html);
  },
  share: function() {
		var urlParam = "http://dtc.ocheng.me/h5/public-store/html/auth.html?cId=36";
		var imgUrl = "http://dtc.ocheng.me/storage/M00/00/01/ChUAWFo7pK2AFWAFAAFTW2im2Uo092.png";
//		var urlParam = "https://edrington.shop/public-store/html/auth.html?cId=36";
//  var imgUrl = "https://edrington.shop/storage/M00/00/01/ChUAWFo7pK2AFWAFAAFTW2im2Uo092.png";
    var title = "麦卡伦官方微商城";
    wechatapi.wxAPI.share(urlParam,imgUrl,title,title);
  },
  initScroll: function() {
    var listWrapper = document.querySelector('.list-wrapper-hook'),
      listContent = document.querySelector('.list-content-hook'),
      topTip = document.querySelector('.refresh-hook'),
      bottomTip = document.querySelector('.loading-hook');
    var scroll = new window.BScroll(listWrapper, {
      probeType: 3,
      click: true
    });
    // 滑动中
    //      scroll.on('scroll', function(position) {
    //        if(position.y > 30) {
    //          topTip.innerText = '释放立即刷新';
    //        }
    //      });
    /*
     * @ touchend:滑动结束的状态
     * @ maxScrollY:屏幕最大滚动高度
     */
    // 滑动结束
    //  scroll.on('touchend', function(position) {
    //    if(position.y > 30) {
    //      setTimeout(function() {
    //        /*
    //         * 下拉刷新，请求第一页数据
    //         */
    //        app.getBrandList();
    //        // 恢复文本值
    //        topTip.innerText = '下拉刷新';
    //        // 刷新列表后,重新计算滚动区域高度
    //        scroll.refresh();
    //      }, 1000);
    //    } else if(position.y < (this.maxScrollY - 30)) {
    //      bottomTip.innerText = '加载中...';
    //      setTimeout(function() {
    //        // 恢复文本值 
    //        bottomTip.innerText = '查看更多';
    //        // 向列表添加数据
    ////        app.getBrandList();
    //        // 加载更多后,重新计算滚动区域高度
    //        scroll.refresh();
    //      }, 1000);
    //    }
    //  });
  }

}
app.init();