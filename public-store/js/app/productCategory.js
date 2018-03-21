var app = {
  categoryList: [],
  init: function() {
    app.getCategoryList();
  },
  // 获取分类详情
  getCategoryList: function() {
    wechatapi.loadingBox();
    // store=public   测试用store=all
    wechat.get_data(API.gateway + API.categoryList + "?companyId="+cId+"&store=public", function(response) {
      console.log(response);
      wechatapi.closeLoading();
      if(response.code == ERR_OK) {
        app.categoryList = response.data;
        app.fillData(response.data);
      }else{
      	wechatapi.prompt(response.msg);
      }
    });
  },
  // 数据显示
  fillData: function(data) {
    //麦卡伦 系列菜单显示
    data.forEach(function(obj){
      if(obj.id == CATEGORYID) {
        var Oneli = "<li class='tab border-bottom-1px' onclick='app.gotoGoodList(\"categoryOneId\","+obj.id+")'>"+obj.categoryName+"</li>";
        $("#categoryOne").append(Oneli);
        // 查询分类下  商品列表
        obj.productVo.forEach(function(productObj){
          var param = {
            "companyId": cId, //公司id
            "page": 1,
            "pageSize": 10,
            "isOnShelf": 1, //上架状态 传1即可
            "categoryTwoId": productObj.id
          }
          wechat.post_data(API.gateway + API.productList, param, function(response) {
            console.log(response);
            if(response.code == ERR_OK) {
              productObj.goodsList = response.data.data;
            }else{
            	wechatapi.prompt(response.msg);
            }
          });
        });
        app.categoryList = obj.productVo;
      }
    });

    var productVoHtml = $('#jsr2').render(app.categoryList);
    $(".classification-hook").empty();
    $(".classification-hook").append(productVoHtml);
  },
  gotoGoodList: function(category,id) {
    //跳转至商品首页
    window.location.href = "home.html?cId=" + cId + "&"+category+"=" + id;
  },
  gotoGoodDetails: function(id) {
    //跳转至商品详情
    window.location.href = "goodDetails.html?cId=" + cId + "&productId=" + id;
  }
};
app.init();