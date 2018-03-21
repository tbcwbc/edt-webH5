var categoryId = localStorage.getItem('categoryId'); //categoryId 分类id
var app = {
  init: function() {
    $(".search-btn-hook").on('click', app.getProductBysearchKey);
    $(".hock-footer>li").on('click', wechatapi.footerGoto);
    $(".classify-hook").on('click', function() {
      window.location.href = "productCategory.html?cId=" + cId;
    });
      app.getCategoryList();
      app.initScroll();
      wechatapi.showShopCartCounts();
  },
  
  //关键字搜索
  getProductBysearchKey: function() {
    var searchKey = encodeURI(encodeURI($(".search-bar-hook").val()));
    window.location.href = "home.html?cId=" + cId + "&searchKey=" + searchKey;
  },
  // 获取分类详情
  getCategoryList: function() {
    wechatapi.loadingBox();
    var param = "?companyId=" + cId + "&store=private";
    // store=public   测试用store=all   private store=private
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
    	if(categoryId == 'all'){
    		obj.productVo.forEach(function(productVoObj) {
          html += "<li onclick='app.gotoHome(" + productVoObj.id + ")'><img src='" + productVoObj.privateStoreImage + "'/></li>"
        });
        return false;
    	}else if(obj.id == categoryId) {
        obj.productVo.forEach(function(productVoObj) {
          html += "<li onclick='app.gotoHome(" + productVoObj.id + ")'><img src='" + productVoObj.privateStoreImage + "'/></li>"
        });
        return false;
      }
    });
    $(".list-content-hook").empty().append(html);
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