/**
 * Created by acmen on 17-2-16.
 */

if (!String.prototype.format) {
    String.prototype.format = function () {
      var val = this,
          args = arguments;
  
      if (args.length == 1 && args[0].constructor == Object) {
        args = arguments[0];
      }
  
      for (var idx in args) {
        val = val.replace(new RegExp('\\$\\{' + idx + '\\}', 'ig'), args[idx]);
      }
      return val;
    };
  }
  
  function wechat() {
      return {
          options: {},
          init_auth: function (companyId, callback) {
  
              var uid = this.get_url_param("wxtoken");
              if (!uid) {
                  var auth_info = localStorage.getItem("OC_WECHAT_AUTH_INFO" + companyId);
                  if (auth_info) {
                      this.options = JSON.parse(auth_info);
                      callback && callback();
                  }
                  this.get_auth(companyId, callback);
              } else {
                  this.options.uid = uid;
                  localStorage.setItem("OC_WECHAT_AUTH_INFO" + companyId, JSON.stringify(this.options));
                  callback && callback();
              }
  
          },
          get_auth: function (companyId, callback) {
              this.post_data("/api/wechat/web/auth", {
                  url: this.get_url(),
                  company_id: companyId
              }, function (data) {
                  if (data.code == 100000) {
  //                  callback && callback();
                      window.location.href = data.data;
                      callback();
  
                  } else {
  
                  }
              }, function () {
  
              });
          },
  
          get_url: function () {
              return window.location.href;
          },
          post_data: function (url, data, suc_callback, fail_callback) {
              var self = this;
              $.ajax({
                  type: "POST",
                  url: url,
                  contentType: "application/json; charset=utf-8",
                  dataType: "json",
                  async: false,
  
                  data: JSON.stringify(data),
                  beforeSend: function (request) {
                      if (self.options && self.options.uid) {
                          //  document.write(self.options.uid);
  
                          request.setRequestHeader("WX-TOKEN", self.options.uid);
                      }
                  },
                  success: function (data) {
                      if (suc_callback) {
                          suc_callback(data);
                      }
                  },
                  error: function (message) {
  
                      if (fail_callback) {
                          fail_callback(message);
                      }
                  }
              });
          },
          get_data: function (url, suc_callback, fail_callback) {
              $.ajax({
                  type: "GET",
                  url: url,
                  contentType: "application/json; charset=utf-8",
                  dataType: "json",
                  async: false,
                  beforeSend: function (request) {
                      if (self.options && self.options.uid) {
  
                          request.setRequestHeader("WX-TOKEN", self.options.uid);
                      }
                  },
                  success: function (data) {
                      if (suc_callback) {
                          suc_callback(data);
                      }
                  },
                  error: function (message) {
                      if (fail_callback) {
                          fail_callback(message);
                      }
                  }
              });
          },
  
          get_url_param: function (name) {
              var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
              var r = window.location.search.substr(1).match(reg);
              if (r != null) return unescape(r[2]);
              return null;
          },
  
          init_jssdk: function (call_back) {
              ///api/wechat/web/get/jssdk
              this.post_data(API.gateway+"wechat/web/get/jssdk", {
                url: this.get_url()
              }, function (data) {
  
                  console.log(data);
                if(data.code == 100000){
                  data = data.data;
                  wx.config({
                    debug: false,
                    appId: data.appId,
                    timestamp: data.timeStamp,
                    nonceStr: data.noncetr,
                    signature: data.signature,
                    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage']
                  });
                  call_back && call_back();
                }else{
                  
                }
              })
          },
  
          chooseImage: function(callback){
                var self= this;
              wx.ready(function(){
                  wx.chooseImage({
                    count: 6,
                    sizeType: ['original', 'compressed'],
                    sourceType: ['album', 'camera'],
                    success: function (res) {
                      var localIds = res.localIds;
                      var temp;
  
                      if (localIds instanceof Array && localIds.length > 0) {
                          temp = localIds;
                      }
                      if (temp.length <= 0) {
                          return false;
                      }
  
                      var local_id = temp.pop();
  
                      self.upload_image(local_id,callback);
  
                    }
                  });
                });
          },
  
          upload_image: function(local_id,callback){
              var self= this;
              wx.ready(function(){
                wx.uploadImage({
                  localId: local_id,
                  isShowProgressTips: 1, // 默认为1，显示进度提示
                  success: function (res) {
                    var serverId = res.serverId; // 返回图片的服务器端ID
                    callback(serverId);
                  }
                });
              });
            }
  
  
  
  
  
      }
  
  }
  