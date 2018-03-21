var app = {
  page: 0,
  selectOrder: [],
  allGoods: [],
  userInfo: wechatapi.getUserInfo(),
  init: function() {
    $(".hock-footer>li").on('click', wechatapi.footerGoto);
    app.getShopCartList();
    wechatapi.showShopCartCounts();
    app.initScroll();
    localStorage.removeItem('ADDRESSID');
    localStorage.removeItem('INVOICEID');
    //  编辑点击事件
    $('.edit-hook').on('click', app.edit);
    //  全选点击事件
    $('input[name=all]').on('click', app.allSelect);

    $('.continue').on('click', function() {
      window.location.href = "home.html?cId=" + cId;
    });
    $('.commit').on('click', app.submitOrder);
  },
  //验证限购商品
  checkLimit: function() {
    var isOk = true;
    var noLimitOrder = [];
    app.selectOrder.forEach(function(obj) {
      if(obj.isLimit != 1) {
        noLimitOrder.push(obj);
      }
    });
    $.each(app.selectOrder, function(index, obj) {
      if(obj.isLimit == 1) {
        if(obj.counts > obj.limitCounts) {
          isOk = false;
          wechatapi.prompt("抱歉您无法下单，" + obj.productSimplifyName + "每人限购" + obj.limitCounts + "件，请调整商品数量后重新下单");
          return false;
        }
        if(obj.limitMoney > 0) {
          var money = 0;
          noLimitOrder.forEach(function(noLimitOrder) {
            money += noLimitOrder.intMoney * noLimitOrder.counts;
          });
          if(money < obj.limitMoney) {
            isOk = false;
            wechatapi.prompt("抱歉您无法下单，订单中非限购商品总金额满" + wechatapi.priceFormat(obj.limitMoney) + "元时才能购买" + obj.productSimplifyName);
            return false;
          }
        }
      }
    });
    return isOk;
  },
  //提交订单
  submitOrder: function() {
    if(wechatapi.check.isEmpty(app.selectOrder)) {
      wechatapi.prompt('未勾选任何商品');
      return false;
    } else if(app.checkLimit()) {
      //存储提交的订单id 
      localStorage.setItem('selectOrder', JSON.stringify(app.selectOrder));
      window.location.href = "orderCommit.html?cId=" + cId;
    }

  },
  // 单个订单选中
  checked: function(id, e) {
    var _this = e.target;
    if(_this.checked) {
      for(var i = 0; i < app.allGoods.length; i++) {
        if(app.allGoods[i].id == id) {
          app.selectOrder.push(app.allGoods[i]);
          //        app.selectOrder.push({
          //          'id': id,
          //          'productId': productId,
          //          'intMoney': app.allGoods[i].intMoney,
          //          'counts': app.allGoods[i].counts
          //        });
          if(app.allGoods.length == app.selectOrder.length) {
            $("input[name='all']")[0].checked = true;
          }
          break;
        }
      }
    } else {
      app.removeByValue(id);
      $("input[name='all']")[0].checked = false;
    }
    app.updateTotal();
  },
  //取消选择订单
  removeByValue: function(id) {
    for(var i = 0; i < app.selectOrder.length; i++) {
      if(app.selectOrder[i].id == id) {
        app.selectOrder.splice(i, 1);
        break;
      }
    }
  },
  //编辑
  edit: function() {
    var _this = $(this);
    if(_this.is('.toggle')) {
      // 编辑完成
      _this.text('编辑').removeClass('toggle');
      $('.delete').addClass('hide');
      $('.commit').removeClass('hide');

      //单个商品编辑隐藏
      $('.count').removeClass('hide');
      $('.edit-wrapper').addClass('hide');
    } else {
      // 商品编辑
      _this.text('完成').addClass('toggle');
      $('.delete').removeClass('hide');
      $('.commit').addClass('hide');
      //单个商品编辑
      $('.count').addClass('hide');
      $('.edit-wrapper').removeClass('hide');

      //监控 数量更改输入
      $("input[type='number']").on('input', function(e) {
        var count = parseInt(e.target.value);
        if(count > 0) {
          app.allGoods.forEach(function(obj) {
            if(e.target.name == obj.id) {
              obj.counts = count;
              $("span[data-count-id='" + e.target.name + "']").text(obj.counts);
              if(obj.isLimit == 1) {
                if(obj.limitCounts != 0) {
                  if(obj.limitCounts <= count) {
                    wechatapi.prompt("该商品每人限购" + obj.limitCounts + "瓶，您已达限额，无法继续添加。");
                    obj.counts = count = obj.limitCounts;
                    $("span[data-count-id='" + e.target.name + "']").text(obj.limitCounts);
                    e.target.value = obj.limitCounts;
                    return false;
                  }else{
                  	wechatapi.prompt("该商品每人限购" + obj.limitCounts + "件");
                  }
                } else {
                  wechatapi.prompt("该商品需订单中非限购商品满" + wechatapi.priceFormat(obj.limitMoney) + "元才能购买");
                }
              }
            }
          });
          app.selectOrder.forEach(function(obj) {
            if(e.target.name == obj.id) {
              obj.counts = count;
            }
          });
          app.updateOrderCount(e.target.name, count);
          app.updateTotal();
        } else {
          wechatapi.prompt('订单数量不能低于1');
        }

      });
    }

  },
  // 提交订单数量更改
  updateOrderCount: function(id, count) {
    var param = [{
      'id': id,
      'counts': count,
      'channel': CNANNEL
    }];
    wechat.post_data(API.gateway + API.updateOrderCount, param, function(response) {
      if(response.code == ERR_OK) {}
    });
  },
  //减少订单数量
  decreaseCount: function(id, counts, isLimit, limitCounts, limitMoney, e) {
    // isLimit ==1 为限制购买商品
    if(isLimit == 1) {
      if(limitCounts != 0) {
        wechatapi.prompt("该商品每人限购" + limitCounts + "件");
      } else {
        wechatapi.prompt("该商品需订单中非限购商品满" + wechatapi.priceFormat(limitMoney) + "元才能购买");
      }
    }
    var _input = $("input[type='number'][name='" + id + "']");
    // 订单数在2条以上 才会减少
    // 更改所有订单列表和已勾选订单列表
    for(var i = 0; i < app.allGoods.length; i++) {
      // 订单数在2条以上 才会减少
      if(id == app.allGoods[i].id) {
        if(parseInt(app.allGoods[i].counts) > 1) {
          counts = app.allGoods[i].counts - 1;
          app.updateOrderCount(id, counts);
          _input.val(counts);
          app.allGoods[i].counts = counts;
          $("span[data-count-id='" + id + "']").text("x" + app.allGoods[i].counts);
          for(var i = 0; i < app.selectOrder.length; i++) {
            if(id == app.selectOrder[i].id) {
              app.selectOrder[i].counts = counts;
              app.updateTotal();
              break;
            }
          }
          break;
        } else {
          wechatapi.prompt('订单数量不能低于1');
        };
      };
    };

  },
  //增加订单数量
  addCount: function(id, counts, isLimit, limitCounts, limitMoney, e) {
    if(isLimit == 1) {
      if(limitCounts != 0) {
        wechatapi.prompt("该商品每人限购" + limitCounts + "件");
      } else {
        wechatapi.prompt("该商品需订单中非限购商品满" + wechatapi.priceFormat(limitMoney) + "元才能购买");
      }
    }
    var _input = $("input[type='number'][name='" + id + "']");
    counts = parseInt(_input.val()) + 1;
    // 更改所有订单列表和已勾选订单列表
    for(var i = 0; i < app.allGoods.length; i++) {
      if(id == app.allGoods[i].id) {
        app.allGoods[i].counts = counts;
        $("span[data-count-id='" + id + "']").text("x" + app.allGoods[i].counts);
        _input.val(counts);
        break;
      }
    }
    for(var i = 0; i < app.selectOrder.length; i++) {
      if(id == app.selectOrder[i].id) {
        app.selectOrder[i].counts = counts;
        break;
      }
    }
    app.updateOrderCount(id, counts);
    app.updateTotal();
  },
  //全选
  allSelect: function() {
    var _allselect = $("input[name='all']")[0];
    var _checkBox = $("input[type=checkbox]:not(input[name='all'])");
    if(_allselect.checked) {
      for(var i = 0; i < _checkBox.length; i++) {
        _checkBox[i].checked = true;
      }
      app.selectOrder = app.allGoods.slice(0);

    } else {
      for(var i = 0; i < _checkBox.length; i++) {
        _checkBox[i].checked = false;
      }
      app.selectOrder = [];
    }
    app.updateTotal();
  },
  // 获取 购物车列表
  getShopCartList: function() {
    var param = {
      channel: CNANNEL,  //渠道
      isPrivate: 1,   //区分会员价格
      memberId: app.userInfo.id,
      id: app.page
    }
    wechatapi.loadingBox();
    wechat.post_data(API.gateway + API.shopCartList, param, function(response) {
      wechatapi.closeLoading();
      if(response.code == ERR_OK) {
        console.log(response);
        app.fillData(response.data);
        slideDelete($('.good-item'));
      } else {
        console.log('网络不佳，请重新加载');
        app.getShopCartList();
      }
    });

  },
  //删除购物车订单
  deleteGood: function(id) {
  	app.allGoods = [];
    var list = [];
    if(id) {
      list.push(id);
    } else if(app.selectOrder.length > 0) {
      app.selectOrder.forEach(function(obj) {
        list.push(obj.id);
      });
    } else {
      wechatapi.prompt('请选择需要删除的订单');
      return false;
    };
    wechat.post_data(API.gateway + API.deleteGood, list, function(response) {
      if(response.code == ERR_OK) {
        $("#goodList").empty();
        app.page = 0;
        app.getShopCartList();
        wechatapi.showShopCartCounts();
        $(".edit-hook").text('编辑');
        $('.delete').addClass('hide');
        $('.commit').removeClass('hide');
      }
    });
  },
  fillData: function(data) {
    // 金额转换
    $.views.helpers({
      fmoney: function(price) {
        return(price / 100).toFixed(2);
      }
    });
    
    if(app.page == 0) {
      $("#goodList").empty();
      app.allGoods = data;
    	app.selectOrder = [];
    }else{
    	app.allGoods.push.apply(app.allGoods,data);
    }
    var html = $('#jsr').render(data);
    $("#goodList").append(html);
    if($("input[name='all']")[0].checked) {
      app.allSelect();
    }
  },
  // 金额合计
  updateTotal: function() {
    var priceSum = 0;
    app.selectOrder.forEach(function(good) {
      priceSum += good.intMoney * good.counts;
    })
    priceSum = (priceSum / 100).toFixed(2);
    $('#total').text(priceSum);
  },
  initScroll: function() {
    var listWrapper = document.querySelector('.list-wrapper-hook'),
      listContent = document.querySelector('.list-content-hook'),
      topTip = document.querySelector('.refresh-hook'),
      bottomTip = document.querySelector('.loading-hook');
    if(listWrapper.clientHeight > listContent.clientHeight) {
      bottomTip.style.display = 'none';
    }
    app.scroll = new window.BScroll(listWrapper, {
      probeType: 1,
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
          app.getShopCartList();
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
          app.page = $('.list-content-hook li:last-child')[0].id;
          // 向列表添加数据
          app.getShopCartList();
          // 加载更多后,重新计算滚动区域高度
          app.scroll.refresh();
        }, 1000);
      }
    });
  }
}
app.init();