String.prototype.format = function (args) {
  var result = this;
  if (arguments.length > 0) {
    if (arguments.length == 1 && typeof (args) == "object") {
      for (var key in args) {
        if (args[key] != undefined) {
          var reg = new RegExp("({" + key + "})", "g");
          result = result.replace(reg, args[key]);
        }
      }
    }
    else {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != undefined) {
          var reg = new RegExp("({[" + i + "]})", "g");
          result = result.replace(reg, arguments[i]);
        }
      }
    }
  }
  return result;
};

/**
 *构造背景的竖条
 */
function build_bg_line(ele) {
  var i = 0;
  var base = -20;
  for (i = 0; i < 30; i++) {
    var div = $("<div>", {"class": "bg-line", "style": "left:" + (base + 2 * i) + "em"});
    ele.append(div);
  }
}

/**
 * 构造圆形
 */
function build_circle(ele, top, left, bottom, right, width, zindex) {
  var style = "left: {left}; right: {right}; top: {top}; bottom: {bottom}; z-index: {z-index}; width: {width}; height: {height}";
  style = style.format({
    "left"   : left,
    "right"  : right,
    "top"    : top,
    "bottom" : bottom,
    "z-index": zindex,
    "width"  : width,
    "height" : width
  });
  var div = $("<div>", {"z-index": zindex, "style": style, "class": "circle"});
  ele.append(div);
}

/**
 * 先隐藏所有的 class main-id 然后显示 rule
 */
function show_rule() {
  $(".main-id").hide();
  $(".rule-contain.rule").show();
}

function show_oops() {
  $(".main-id").hide();
  $(".rule-contain.oops").show();
}

function close_rule() {
  $(".rule-contain").hide();
  $(".main-id").show();
}

function build_big_circle(ele, width) {
  ctx = ele[0].getContext("2d");
  ctx.clearRect(0, 0, width, width);

  var bg_img = new Image();
  bg_img.onload = function () {
    ctx.drawImage(bg_img, 0, 0, width, width);
  };
  bg_img.src = "./img/yinying.png";
  ctx.save();

  var circle_img = new Image();
  circle_img.onload = function () {
    ctx.drawImage(circle_img, 4, 4, width - 8, width - 8);
  };
  circle_img.src = "./img/zhuanpan.png";
  ctx.save();


  var point_img = new Image();
  point_img.onload = function () {
    ctx.drawImage(point_img, 4, 4, width - 8, width - 8);
  };
  point_img.src = "./img/zhuanpan.png";
  ctx.save();

  return point_img;
}

function build_big_circle_bak(ele, width, items) {
  var x = width / 2;
  var y = width / 2;
  var radius = width / 2;
  var start_angle = 0;
  var end_angle = 0;
  var ctx = null;
  ctx = ele[0].getContext("2d");

  // 绘制整个圆circle
  ctx.strokeStyle = "#dddddd";
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  end_angle = 2 * Math.PI;
  ctx.arc(x, y, radius, start_angle, end_angle, true);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  // 绘制各个选项
  var len = items.length;
  var item_angle = 2 * Math.PI / len;
  start_angle = item_angle / 2;
  for (i = 0; i < len; i++) {
    ctx.strokeStyle = "#dddddd";
    if (i % 2 == 1) {
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.fillStyle = "#DDAE54";
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    end_angle = (start_angle + item_angle) % (2 * Math.PI);
    ctx.arc(x, y, radius, start_angle, end_angle, false);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    // draw img
    var img = new Image();
    img.onload = function () {
      ctx.drawImage(img, 0, 0, 100, 100);
    };
    img.src = items[i];
    ctx.restore();
    start_angle += (item_angle);
  }

}

function circle_run(ele, len, prize) {
  //强制停止转盘的转动
  ele.stopRotate();
  //调用转动方法，设置转动所需参数和回调函数
  ele.rotate({
    //起始角度
    angle    : 0,
    //转动角度 +1800是为了多转几圈
    animateTo: 100 + 1800,
    duration : 8000,
    callback : function () {
      window.location.href = "goods.html";
    }
  });
}

function build_card(ele, left, right, top, bottom, zindex, width, rotate, img_src) {
  var style = "left: {left}; right: {right}; top: {top}; bottom: {bottom}; z-index: {z-index}; width: {width}; -moz-transform: {-moz-transform}; -webkit-transform: {-webkit-transform}; " +
    "-o-transform: {-o-transform}; -ms-transform: {-ms-transform}; transform: {transform}";
  style = style.format({
    "left"             : left,
    "right"            : right,
    "top"              : top,
    "bottom"           : bottom,
    "z-index"          : zindex,
    "width"            : width,
    "-moz-transform"   : "rotate(" + rotate + "deg)",
    "-webkit-transform": "rotate(" + rotate + "deg)",
    "-o-transform"     : "rotate(" + rotate + "deg)",
    "-ms-transform"    : "rotate(" + rotate + "deg)",
    "transform"        : "rotate(" + rotate + "deg)"
  });
  var div = $("<div>", {"style": style, "class": "card"}).append($("<img>",{"src": img_src, "width": "100%"}));
  ele.append(div);
}