$("#input").focus();
_indList = new Array(["Baidu", "Google", "https://www.baidu.com/s?wd=", "https://www.google.com.hk/#q="], ["Zhihu", "Wikipedia", "https://www.zhihu.com/search?q=", "https://en.wikipedia.org/wiki/"], ["Baidu", "Google", "http://fanyi.baidu.com/translate#auto/zh/", "https://translate.google.cn/#auto/zh-CN/"], ["Weibo", "WeChat", "http://s.weibo.com/weibo/", "http://weixin.sogou.com/weixin?type=2&query="]);
_usrslt = 0;

function show(str) {
    openTag(2, str);
}
var Params = {
    "XOffset": -2,
    "YOffset": -2,
    // "width": $('#input').innerWidth(),
    "fontColor": "#555",
    "fontColorHI": "#555",
    "fontSize": "",
    "fontFamily": "",
    "borderColor": "#eee",
    "bgcolorHI": "#eee",
    "sugSubmit": true
};
BaiduSuggestion.bind('input', Params, show);
$("span[id$='srch']").click(function() {
    $("span[id$='srch']").attr("class", "btn btn-default btn-sm");
    $(this).attr("class", "btn btn-info btn-sm active");
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

$("button[id^='srhbt']").click(function() {
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