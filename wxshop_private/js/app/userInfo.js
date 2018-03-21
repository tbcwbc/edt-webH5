var app = {
  fromPage: wechat.get_url_param('fromPage'),
  proList: [],
  cityList: [],
  info: {},
  infoParam: {},
  loadingToast: $('#loadingToast'),
  tagAlert: $('#tag'),
  tagAll: [],
  industryList: [],
  hobbyList: [],
  loveList: [],
  targetList: [],
  selectGroup: '',
  groupName: '',
  companyId: '',

  // 初始化
  init: function () {
    $("#save").on('click', app.saveMessage);

    $("#ok").on('click', app.ok);
    $("#no").on('click', app.no);

    app.getUserInfo();

    app.proChange();

  },

  getUserInfo: function () {
    app.info = JSON.parse(localStorage.getItem('USERINFO'));
    if (app.info.id) {
      wechat.get_data(API.gateway + API.memberInfo + app.info.id, function (response) {
        console.log(response);
        var code = response.code;
        if (code == 100000) {
          var info = response.data;
          app.companyId = response.data.companyId;
          // $('#name').val(info.username);
          $('#firstName').val(info.firstName);
          $('#lastName').val(info.secondName);
          $('#sex').val(info.gender);
          $('#tel').val(info.tel);
          $('#spareTelFirst').val(info.spareTelFirst);

          if (info.globalRoaming) {
            var g = info.globalRoaming.substring(1, info.globalRoaming.length);
            $("#areaCode").val(g);
          }

          //                  $('#spareTelSecond').val(info.spareTelSecond);
          //                  $('#spareTelThird').val(info.spareTelThird);
          if (info.birthday) {
            var birthday = moment(info.birthday).format('YYYYMMDD');
            $('.sel_year').attr('rel', birthday.substring(0, 4));
            $('.sel_month').attr('rel', birthday.substring(4, 6));
            $('.sel_day').attr('rel', birthday.substring(6, 8));
          }

          $('#datepicker').val(birthday);
          $('#age').val(info.ageRange);

          if (info.memberTagGroups) {
            $.each(info.memberTagGroups, function (index, data) {
              if (data.tagGroupName == '行业') {
                $.each(data.tagList, function (ind, da) {
                  app.industryList.push({
                    tagId: da.id,
                    tagGroupId: da.tagGroupId,
                    name: da.tagName
                  });
                })
                app.showLabel(app.industryList, 'industry', app.industryList);

              }

              if (data.tagGroupName == '爱好') {
                $.each(data.tagList, function (ind, da) {
                  app.hobbyList.push({
                    tagId: da.id,
                    tagGroupId: da.tagGroupId,
                    name: da.tagName
                  });
                })
                app.showLabel(app.hobbyList, 'hobby', app.hobbyList);

              }

              if (data.tagGroupName == '酒类偏好') {
                $.each(data.tagList, function (ind, da) {
                  app.loveList.push({
                    tagId: da.id,
                    tagGroupId: da.tagGroupId,
                    name: da.tagName
                  });
                })
                app.showLabel(app.loveList, 'love', app.loveList);

              }
              if (data.tagGroupName == '主要购酒目的') {
                $.each(data.tagList, function (ind, da) {
                  app.targetList.push({
                    tagId: da.id,
                    tagGroupId: da.tagGroupId,
                    name: da.tagName
                  });
                })
                app.showLabel(app.targetList, 'target', app.targetList);

              }

            })
          }

          app.getProList(function () {
            if (info.province) {
              $("#input_province").val(info.province);
              app.getCityList(info.province, function () {
                $("#input_city").val(info.city);
              })
            }
          })

        }
      });

      app.getTagList(app.info.companyId);
    }
  },

  getTagList: function (cId) {
    wechat.get_data(API.gateway + API.tagList + cId, function (response) {
      console.log(response);
      var code = response.code;
      if (code == 100000) {
        app.tagAll = response.data;
        $('#industry_li').on('click', app.industryClick);
        $('#hobby_li').on('click', app.hobbyClick);
        $('#love_li').on('click', app.loveClick);
        $('#target_li').on('click', app.targetClick);
      }
    });
  },

  // 保存信息
  saveMessage: function () {

    if (app.check()) {

      var tagList = app.industryList.concat(app.hobbyList).concat(app.loveList).concat(app.targetList);

      var userInfo = {
        companyId: app.info.companyId,
        id: app.info.id,
        // username: app.infoParam.username,
        firstName: app.infoParam.firstName,
        secondName: app.infoParam.secondName,
        gender: app.infoParam.gender,
        tel: app.infoParam.tel,
        globalRoaming: '+' + app.infoParam.globalRoaming,
        spareTelFirst: app.infoParam.spareTelFirst,
        birthday: (app.getBirthday(app.infoParam.year, app.infoParam.month, app.infoParam.day) * 1000).toString(),
        province: app.infoParam.province,
        provinceName: app.findCityName(app.proList, app.infoParam.province),
        city: app.infoParam.city,
        cityName: app.findCityName(app.cityList, app.infoParam.city),
        ageRange: $('#age').val(),
        tagList: tagList
      }

      app.startSave(userInfo);

    }

  },
  check: function () {
    var province = $('#input_province').val();
    var city = $('#input_city').val();
    var year = $('.sel_year').val();
    var month = $('.sel_month').val();
    var day = $('.sel_day').val();
    var username = $('#name').val();
    var firstName = $('#firstName').val();
    var lastName = $('#lastName').val();
    var gender = $('#sex').val();
    var tel = $('#tel').val();
    var globalRoaming = $("#areaCode").val();
    var spareTelFirst = $('#spareTelFirst').val();

    if (wechatapi.check.isEmpty(firstName)) {
      wechatapi.prompt("用户姓氏不能为空");
      return false;
    } else if (wechatapi.check.isEmpty(lastName)) {
      wechatapi.prompt("用户名不能为空");
      return false;
    } else if (wechatapi.check.isEmpty(gender)) {
      wechatapi.prompt("请选择性别");
      return false;
    } else if (wechatapi.check.isEmpty(globalRoaming)) {
      wechatapi.prompt("请选择区号");
      return false;
    } else if (wechatapi.check.isEmpty(tel)) {
      wechatapi.prompt("手机号不能为空");
      return false;
    } else if ((!wechatapi.check.isEmpty(spareTelFirst)) && (!wechatapi.check.isPhone(spareTelFirst))) {
      wechatapi.prompt('备用手机号格式有误');
      return false;
    } else if (year == '0' || month == '0' || day == '0') {
      wechatapi.prompt('请填写完整生日信息');
      return false;
    } else if ((isNaN(province) && isNaN(city)) || wechatapi.check.isEmpty(province) || wechatapi.check.isEmpty(city)) {
      wechatapi.prompt('请填写省市');
      return false;
    } else if (globalRoaming == '86') {
      if (!app.mainland(tel)) {
        wechatapi.prompt('请填写正确手机号');
        return false;
      }
    } else if (globalRoaming == '852') {
      if (!app.hk(tel)) {
        wechatapi.prompt('请填写正确手机号');
        return false;
      }
    } else if (globalRoaming == '853') {
      if (!app.macau(tel)) {
        wechatapi.prompt('请填写正确手机号');
        return false;
      }
    } else if (globalRoaming == '886') {
      if (!app.taiwan(tel)) {
        wechatapi.prompt('请填写正确手机号');
        return false;
      }
    }

    // else if(!wechatapi.check.isPhone(tel)) {
    //   wechatapi.prompt("手机号格式有误");
    //   return false;
    // }

    app.infoParam = {
      "province": province,
      "city": city,
      "year": year,
      "month": month,
      "day": day,
      // "username": username,
      "firstName": firstName,
      "secondName": lastName,
      "gender": gender,
      "tel": tel,
      "globalRoaming": globalRoaming,
      "spareTelFirst": spareTelFirst
    }
    return true;

  },

  // 大陆手机号
  mainland: function (tel) {
    var patt = /^[1][3-8]\d{9}$/;
    return patt.test(tel)
  },

  // 香港
  hk: function (tel) {
    var patt = /^([6|9])\d{7}$/;
    return patt.test(tel)
  },
  macau: function (tel) {
    var patt = /^[6]([8|6])\d{5}$/;
    return patt.test(tel)
  },

  taiwan: function (tel) {
    var patt = /^[0][9]\d{8}$/;
    return patt.test(tel)
  },

  startSave: function (data) {
    app.loadingToast.fadeIn();

    wechat.post_data(API.gateway + API.updateMember, data, function (response) {
      console.log(response);
      app.loadingToast.fadeOut();
      var code = response.code;
      if (code == 100000) {
        window.location.href = "my.html?cId=" + cId;
      } else {
        wechatapi.prompt(response.msg);
      }
    });

  },

  // 获取省列表
  getProList: function (callback) {
    wechat.get_data(API.gateway + API.cityList + 1, function (response) {
      var code = response.code;
      if (code == 100000) {
        app.proList = response.data;
        app.setCityOptions(response.data, 'input_province');
        callback && callback();
      }
    });

  },
  // 点击省 获取市
  proChange: function () {
    $("#input_province").change(function () {
      if ($(this).val() == "") return;
      $("#input_city option").remove();
      var code = $(this).find("option:selected").val();
      app.getCityList(code);
    });

  },
  getCityList: function (code, callback) {
    wechat.get_data(API.gateway + API.cityList + code, function (response) {

      var code = response.code;
      if (code == 100000) {
        app.cityList = response.data;
        app.setCityOptions(response.data, 'input_city');
        callback && callback();
      }
    });
  },

  // 赋值option
  setCityOptions: function (data, id) {
    var html = "<option value=''>请选择</option>";
    $.each(data, function (index, item) {
      html += "<option value='" + item.cityId + "' exid='" + item.cityId + "'>" + item.cityName +
        "</option>";
    });
    $("#" + id).append(html);
  },
  // 根据城市id 找到城市名
  findCityName: function (list, cityId) {
    var name;
    $.each(list, function (index, item) {
      if (item.cityId == cityId) {
        name = item.cityName;
      }
    })
    return name;
  },

  industryClick: function () {
    app.groupName = "行业";
    app.tagAlert.fadeIn();
    app.setOptions();

  },

  hobbyClick: function () {
    app.groupName = "爱好";
    app.tagAlert.fadeIn();
    app.setOptions();
  },

  loveClick: function () {
    app.groupName = "酒类偏好";
    app.tagAlert.fadeIn();
    app.setOptions();
  },

  targetClick: function () {
    app.groupName = "主要购酒目的";
    app.tagAlert.fadeIn();
    app.setOptions();
  },

  setOptions: function () {
    var tempArr;
    $.each(app.tagAll, function (index, data) {
      if (data.tagGroupName == app.groupName) {
        tempArr = data.tagList;
        app.selectGroup = data.id;
      }
    })

    var select = [];
    if (app.groupName == "行业") {
      select = app.industryList;
    }

    if (app.groupName == "爱好") {
      select = app.hobbyList;
    }

    if (app.groupName == "酒类偏好") {
      select = app.loveList;
    }

    if (app.groupName == "主要购酒目的") {
      select = app.targetList;
    }

    var content = $("#checkContent");
    content.empty();
    $.each(tempArr, function (index, data) {
      var label = $("<label  class='weui-agree' style='float:left'>");
      var input = $("<input value='" + data.id + "' iname='" + data.tagName + "' type='checkbox' class='weui-agree__checkbox'>");
      var name = $(" <span class='weui-agree__text'>" + data.tagName + "</span>");
      label.append(input);
      label.append(name);
      content.append(label);

      $.each(select, function (index, i) {
        if (i.tagId == data.id) {
          input.attr('checked', 'true');
        }

      });

    })

  },

  ok: function () {
    var ids = [];
    $('[type=checkbox]:checked').each(function () {
      var name = $(this).attr("iname");
      ids.push({
        tagId: this.value,
        tagGroupId: app.selectGroup,
        name: name
      });

    });

    if (app.groupName == "行业") {
      app.industryList = ids;
      app.showLabel(app.industryList, 'industry', ids);
    }
    if (app.groupName == "爱好") {
      app.hobbyList = ids;
      app.showLabel(app.hobbyList, 'hobby', ids);
    }

    if (app.groupName == "酒类偏好") {
      app.loveList = ids;
      app.showLabel(app.loveList, 'love', ids);
    }
    if (app.groupName == "主要购酒目的") {
      app.targetList = ids;
      app.showLabel(app.targetList, 'target', ids);
    }

    app.no();

  },

  no: function () {
    app.tagAlert.fadeOut();
  },

  showLabel: function (list, id, selected) {
    list = selected;
    if (list.length > 0) {
      $("#" + id).html(list[0].name + '...');
    } else {
      $("#" + id).html('请选择');
    }
  },

  getBirthday: function (year, month, day) {
    if (month <= 9) {
      month = '0' + month;
    }
    if (day <= 9) {
      day = '0' + day;
    }

    var str = "2000" + month + day;
    return moment(str).format("X");
  }

}

app.init();