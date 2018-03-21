var app = {

  memberId: "",
  proList: [],
  cityList: [],
  areaList: [],
  addressParam: {},
  // 初始化
  init: function() {

    app.getUserInfo();
    $('.hock-save').on('click', app.save)

    app.getProList();

    app.proChange();

    app.cityChange();

  },

  // 获取用户信息
  getUserInfo: function() {
    var info = JSON.parse(localStorage.getItem('USERINFO'));
    if(info) {
      app.memberId = info.id;
    }

  },

  save: function() {

    if(app.check()) {
      var data = {
        memberId: app.memberId,
        name: app.addressParam.name,
        phone: app.addressParam.phone,
        address: app.addressParam.address,
        isDefault: app.addressParam.value,
        province: app.addressParam.province,
        provinceName: app.findCityName(app.proList, app.addressParam.province),
        city: app.addressParam.city,
        cityName: app.findCityName(app.cityList, app.addressParam.city),
        district: app.addressParam.district,
        districtName: app.findCityName(app.areaList, app.addressParam.district),
        zipCode: $("#zipCode").val()
      }

      wechat.post_data(API.gateway + API.createAddress, data, function(response) {
        var code = response.code;
        console.log(response);
        if(code == 100000) {
          window.location.href = `address.html?cId=${cId}`;
        } else {
          wechatapi.prompt(response.msg);
        }
      });

    }

  },
  // 验证
  check: function() {
    var province = $('#input_province').val();
    var city = $('#input_city').val();
    var district = $('#input_area').val();
    var value = $('input:checkbox:checked').val();
    var name = $("#name").val();
    var phone = $("#phone").val();
    var address = $("#address").val();

    if(value) {} else {
      value = "2";
    }
    if(wechatapi.check.isEmpty(name)) {
      wechatapi.prompt('姓名不能为空');
      return false;
    } else if(wechatapi.check.isEmpty(phone)) {
      wechatapi.prompt('手机号不能为空');
      return false;
    } else if(!wechatapi.check.isPhone(phone)) {
      wechatapi.prompt('手机号格式有误');
      return false;
    } else if(wechatapi.check.isEmpty(address) || wechatapi.check.isEmpty(province) || wechatapi.check.isEmpty(city)) {
      wechatapi.prompt('地址信息不能为空');
      return false;
    }
    app.addressParam = {
      "province": province,
      "city": city,
      "district": district,
      "value": value,
      "name": name,
      "phone": phone,
      "address": address
    }
    return true;

  },

  // 获取省列表
  getProList: function() {
    wechat.get_data(API.gateway + API.cityList + 1, function(response) {
      var code = response.code;
      if(code == 100000) {
        app.proList = response.data;
        app.setCityOptions(response.data, 'input_province');
      }
    });

  },
  // 点击省 获取市
  proChange: function() {
    $("#input_province").change(function() {
      if($(this).val() == "") return;
      $("#input_city option").remove();
      $("#input_area option").remove();
      var html = "<option value=''>请选择</option>";
      $("#input_area").append(html);

      var code = $(this).find("option:selected").val();
      app.getCityList(code);
    });

  },

  // 点击市 获取区
  cityChange: function() {
    $("#input_city").change(function() {
      if($(this).val() == "") return;
      $("#input_area option").remove();
      var code = $(this).find("option:selected").val();
      app.getAreaList(code);
    });
  },

  getCityList: function(code) {
    wechat.get_data(API.gateway + API.cityList + code, function(response) {

      var code = response.code;
      if(code == 100000) {
        app.cityList = response.data;
        app.setCityOptions(response.data, 'input_city');
      }
    });
  },

  getAreaList: function(code) {
    wechat.get_data(API.gateway + API.cityList + code, function(response) {

      var code = response.code;
      if(code == 100000) {
        app.areaList = response.data;
        app.setCityOptions(response.data, 'input_area');
      }
    });
  },

  // 赋值option
  setCityOptions: function(data, id) {
    var html = "<option value=''>请选择</option>";
    $.each(data, function(index, item) {
      html += "<option value='" + item.cityId + "' exid='" + item.cityId + "'>" + item.cityName +
        "</option>";
    });
    $("#" + id).append(html);
  },
  // 根据城市id 找到城市名
  findCityName: function(list, cityId) {
    var name;
    $.each(list, function(index, item) {
      if(item.cityId == cityId) {
        name = item.cityName;
      }
    })
    return name;
  }

}

app.init();