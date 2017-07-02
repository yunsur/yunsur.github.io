// fix menu and sidebar

$(document).ready(function() {
    // fix menu when passed
    $('.masthead').visibility({
        once: false,
        onBottomPassed: function() {
            $('.fixed.menu').transition('fade in');
        },
        onBottomPassedReverse: function() {
            $('.fixed.menu').transition('fade out');
        }
    });
    // create sidebar and attach to menu open
    $('.ui.sidebar').sidebar('attach events', '.toc.item');
});

// loading dimmer
$('.loading-trigger').click(function() {
    $('#loading-dimmer').dimmer('show');
});

// progress bar
$('#page-loading-progress').progress({
    total: 1,
    onSuccess: function() {
        $('#page-loading-progress').fadeOut(1000, function() {
            $('#page-loading-progress').remove();
        });
    }
});

function loading(update) {
    if (update) {
        $('#page-loading-progress').progress('increment');
    };
};
loading(true);
setInterval(function() {
    loading(false);
}, 15000);

// masthead background
$('.ui.inverted.masthead.segment').addClass('bg' + Math.ceil(Math.random() * 14)).removeClass('zoomed');

// search
$("#input").focus();
_indList = new Array(["Baidu", "Google", "https://www.baidu.com/s?wd=", "https://www.google.com.hk/#q="], ["Zhihu", "Wikipedia", "https://www.zhihu.com/search?q=", "https://en.wikipedia.org/wiki/"], ["Baidu", "Google", "http://fanyi.baidu.com/translate#auto/zh/", "https://translate.google.cn/#auto/zh-CN/"], ["Weibo", "WeChat", "http://s.weibo.com/weibo/", "http://weixin.sogou.com/weixin?type=2&query="]);
_usrslt = 0;

function show(str) {
    openTag(2, str);
}
var Params = {
    "XOffset": -1,
    "YOffset": -1,
    // "width": $('#input').innerWidth(),
    "fontColor": "rgba(0, 0, 0, 0.87)",
    "fontColorHI": "rgba(0, 0, 0, 0.87)",
    "fontSize": "14px",
    "fontFamily": "Lato, 'Helvetica Neue', Arial, Helvetica, sans-serif",
    "borderColor": "rgba(34, 36, 38, 0.14902)",
    "bgcolorHI": "rgba(0, 0, 0, 0.05)",
    "sugSubmit": false
};
BaiduSuggestion.bind('input', Params, show);
$("a[id$='srch']").click(function() {
    $("a[id$='srch']").attr("class", "ui basic large label");
    $(this).attr("class", "ui green large label");
    _usrslt = $(this).attr("tmp");
    $("#srhbt0").html(_indList[_usrslt][0]);
    if (_indList[_usrslt][1] == "") {
        $("#srhbt1").hide()
    } else {
        $("#srhbt1").show();
        $("#srhbt1").html(_indList[_usrslt][1])
    }
    $("#input").focus()
});

function HTMLDeCode(str) {
    var s = "";
    if (str.length == 0) {
        return "";
    }
    s = str.replace("+", "%2B").replace(" ", "%20").replace("/", "%2F").replace("?", "%3F").replace("#", "%23").replace("&", "%26").replace("=", "%3D");
    return s;
}

function openTag(_idstr, _srhstr) {
    window.open(_indList[_usrslt][_idstr] + HTMLDeCode(_srhstr), "_blank")
}

$("a[id^='srhbt']").click(function() {
    var _idstr = $(this).attr("id");
    _idstr = parseInt(_idstr.charAt(_idstr.length - 1)) + 2;
    _srhstr = $("#input").val();
    openTag(_idstr, _srhstr)
});

$(document).keydown(function(event) {
    if (event.keyCode == 13) {
        _srhstr = $("#input").val();
        if (_srhstr != "" && $("[class='bdSug_ml']").html() == null) {
            openTag(2, _srhstr)
        }
    } else if (event.keyCode == 71) {
        _srhstr = $("#input").val();
        if (_srhstr != "" && $("[class='bdSug_ml']").html() == null) {
            openTag(3, _srhstr)
        }
    } else {
        return true;
    }
});