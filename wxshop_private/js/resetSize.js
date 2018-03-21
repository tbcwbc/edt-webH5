(function () {
    var html = document.documentElement;
    var field = 'currentFontSize';
    var setFontSize = function () {
        var w = html.clientWidth;
        var h = html.clientHeight;
        if (w > h) {
            w = h;
        }
        var baseSize = 12;
        var baseWidth = 320;
        var scale = w / baseWidth;
        var fontSize = Math.floor(scale * baseSize);
        fontSize = fontSize < baseSize ? baseSize : fontSize;
        if (fontSize === html[field]) {
            return false;
        }
        html.style.fontSize = fontSize + 'px';
        html[field] = fontSize;
    };
    window.addEventListener('resize', setFontSize);
    setFontSize();
})();
