var categoryId = '';
var app = {
  productList: [],
  userInfo: wechatapi.getUserInfo(),
  init: function() {
    app.getCategoryList();
    $(".tab").on('click', app.changeCategory);
  },
  //分类查询
  changeCategory: function(e) {
    var _this = $(this);
    $(".tab").removeClass('check');
    _this.addClass('check');
    categoryId = e.target.id;
//  localStorage.setItem('categoryId', categoryId); //categoryId 分类id
    var categoryList = JSON.parse(localStorage.getItem('allProductInfo'));
    app.fillData(categoryList);
//  app.getCategoryList();
  },
  // 获取分类详情
  getCategoryList: function() {
    wechatapi.loadingBox();
    var param = "?companyId=" + cId + "&store=private";
    // store=public   测试用store=all  store=private
    wechat.get_data(API.gateway + API.categoryList + param, function(response) {
      console.log(response);
      wechatapi.closeLoading();
      if(response.code == ERR_OK) {
        app.fillData(response.data);
        localStorage.setItem('allProductInfo',JSON.stringify(response.data));
      }
    });
  },
  getproductPrivateList: function(productVo) {
    productVo.forEach(function(productObj) {
      var param = {
        "companyId": cId, //公司id
        "employeeId": app.userInfo.employeeId ? app.userInfo.employeeId : 0, // 销售id
        "channel": "private", //app--private--public
        "page": 1,
        "isOnShelf": 1, //上架状态 传1即可
        "categoryTwoId": productObj.id,
      }
      wechat.post_data(API.gateway + API.productPrivateList, param, function(response) {
        console.log(response);
        if(response.code == ERR_OK) {
          productObj.goodsList = response.data.data;
          app.productList.push(productObj);
        }
      });
    });
  },
  // 数据显示
  fillData: function(data) {
    app.productList = [];
    //菜单显示
    data.forEach(function(obj) {
      if(!categoryId) {
        var Oneli = "<li class='tab border-bottom-1px' id='" + obj.id + "'>" + obj.categoryName + "</li>";
        $("#categoryOne").append(Oneli);
        // 查询分类下  商品列表
        app.getproductPrivateList(obj.productVo);
      } else if(categoryId && categoryId == 'all') {
        app.getproductPrivateList(obj.productVo);
        return false;
      } else if(categoryId && obj.id == categoryId) {
        app.productList = [];
        // 查询分类下  商品列表
        app.getproductPrivateList(obj.productVo);
        return false;
      }
    });
    var productVoHtml = $('#jsr2').render(app.productList);
    $(".classification-hook").empty();
    $(".classification-hook").append(productVoHtml);
  },
  gotoGoodList: function(id) {
    //跳转至商品首页
    window.location.href = "home.html?cId=" + cId + "&categoryTwoId=" + id;
  },
  gotoGoodDetails: function(id) {
    //跳转至商品详情
    window.location.href = "goodDetails.html?cId=" + cId + "&productId=" + id;
  }
};
app.init();