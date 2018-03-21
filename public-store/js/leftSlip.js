var slideDelete = function(list) {

  for(var i = 0; i < list.length; i++) {
  	var x, y, endX, endY, swipeX, swipeY;
    list[i].addEventListener('touchstart', function(e) {
      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;
      swipeX = true;
      swipeY = true;
    });
    list[i].addEventListener('touchmove', function(e) {
      endX = event.changedTouches[0].pageX;
      endY = event.changedTouches[0].pageY;
      // 左右滑动
      if(swipeX && Math.abs(endX - x) - Math.abs(endY - y) > 0) {
      	// 阻止事件冒泡
      	e.stopPropagation();
      	// 右滑
      	if(endX - x > 20){
      		e.stopPropagation();
      		$(this).removeClass('swipeleft');
      	}
      	// 左滑
      	if(x - endX > 20){
      		e.stopPropagation();
      		$(this).addClass('swipeleft');
      	}
      	swipeY = false;
      }
      // 上下滑动
      if(swipeY && Math.abs(endX - x) - Math.abs(endY - y) < 0){
      	swipeX = false;
      }
    });
  }
}