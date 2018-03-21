/**
 * Created by sunjunfu on 16/7/20.
 */

function BoyWalk() {
    var boy = {};
    var container = $("#my-content");
    // 页面可视区域
    var visualWidth = container.width();
    var visualHeight = container.height();

    // 获取数据
    var getValue = function(className) {
        var $elem = $('' + className + '');
        // 走路的路线坐标
        return {
            height: $elem.height(),
            top: $elem.position().top
        };
    };
    // 路的Y轴
    var pathY = function() {
        var data = getValue('.a_background_middle');
        return data.top + data.height / 2;
    }();
    var $boy = $("#boy");
    var boyWidth = $boy.width();
    var boyHeight = $boy.height();
    // 修正小男孩的正确位置
    $boy.css({
        top: pathY - boyHeight + 25
    });

    // 暂停走路
    boy.pauseWalk = function() {
        $boy.addClass('pauseWalk');
    };

    // 恢复走路
    boy.restoreWalk = function() {
        $boy.removeClass('pauseWalk');
    };
    // css3的动作变化
    boy.slowWalk = function() {
        $boy.addClass('slowWalk');
    };

    // function startRun(time,proportionX) {
    //
    //     var dfdPlay = $.Deferred();
    //
    //     $boy.animate({left:$("#my-content").width()*proportionX},time,function () {
    //
    //         dfdPlay.resolve();
    //     });
    //
    //     return dfdPlay;
    //     // $boy.css({
    //     //     'transition-timing-function': 'linear',
    //     //     'transition-duration': time+"ms",
    //     //     'transform': 'translateX(' + $("#my-content").width()*proportionX + 'px)' //设置页面X轴移动
    //     // });
    //
    // };
    
    boy.walkTo = function (time,proportionX) {
        var dfdPlay = $.Deferred();
        $boy.animate({left:$("#my-content").width()*proportionX},time,function () {
            dfdPlay.resolve();
        });
        return dfdPlay;
    }
    
    
    return boy;
}


