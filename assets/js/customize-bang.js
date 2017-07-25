// Baidu suggest
$("#input").focus();
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
BaiduSuggestion.bind('input', Params);

// add !
$('#bang').click(function(){
    document.getElementById('input').value='!'; 
    $("#input").focus();
})

// config
var search_tag = '!';
var default_engine = 'b';

$(document).keydown(function (event) {
    if (event.keyCode == 13 || event.altKey && window.event.keyCode == 66) {
        var text = document.getElementById("input").value;
        open_queryURL(text);
    } else {
        return true;
    }
})

function open_queryURL(text) {
    var res = text.split(" ");
    var search_engine = res.shift();
    if (search_engine.charAt(0) != search_tag) {
        res.unshift(search_engine);
        search_engine = "null";
    }
    var string_query = res.join("%20");
    var queryURL = make_queryURL(get_search_engine(search_engine), string_query);
    window.open(queryURL);
}

function get_search_engine(ss) {
    var ret = undefined;
    var arr = {
        '1': 'http://search.yhd.com/c0-0/k%s&enc=utf-8',
        '163': 'https://music.163.com/#/search/m/?s=%s',  
        '360': 'https://www.so.com/s?utf-8&q=%s',
        '500': 'https://500px.com/search?q=%s',
        'ac': 'http://www.acfun.cn/search/#query=%s',
        'aq': 'http://so.iqiyi.com/so/q_%s',       
        'am': 'https://www.amazon.com/s/?keywords=%s',
        'b': 'https://www.baidu.com/s?wd=%s',
        'bi': 'https://www.bilibili.com/search?keyword=%s',
        'bq': 'http://www.ubiaoqing.com/search/%s',
        'bt': 'http://fanyi.baidu.com/translate#auto/zh/%s',
        'd': 'https://duckduckgo.com/?q=%s',
        'db': 'https://www.douban.com/search?q=%s',
        'dd': 'http://search.dangdang.com/?key=%s&enc=utf-8',
        'fb': 'https://www.facebook.com/search/top/?q=%s',          
        'fk': 'https://secure.flickr.com/search/?q=%s',
        'g': 'http://www.google.com/search?q=%s',
        'gh': 'https://github.com/search?utf8=✓&q=%s',
        'gt': 'https://translate.google.cn/#auto/zh-CN/%s',
        'ins': 'https://www.instagram.com/explore/tags/%s',
        'jd': 'https://search.jd.com/Search?keyword=%s&enc=utf-8',
        'kd': 'https://www.kuaidi100.com/courier/?searchText=%s',        
        'qm': 'https://y.qq.com/portal/search.html#w=%s',   
        'r': 'https://www.reddit.com/search?q=%s',      
        'sf': 'http://stackoverflow.com/search?q=%s',      
        'tb': 'https://s.taobao.com/search?q=%s',
        'tm': 'https://list.tmall.com/search_product.htm?q=%s',
        'tw': 'https://twitter.com/search?q=%s',
        'xm': 'http://www.xiami.com/search?key=%s',
        'wb': 'http://s.weibo.com/weibo/%s',
        'wx': 'http://weixin.sogou.com/weixin?type=2&query=%s',
        'wiki': 'https://en.wikipedia.org/wiki/%s',
        'yk': 'http://www.soku.com/search_video/q_%s',
        'yd': 'http://fanyi.youdao.com/translate?i=%s',
        'zh': 'https://www.zhihu.com/search?q=%s'     
    };
    var engine = ss.substr(1);
    ret = arr[engine];
    if (!ret) {
        ret = arr[default_engine];
    }
    return ret;
}

function make_queryURL(search_engine, string_query) {
    var ret = search_engine.replace('%s', string_query);
    return ret;
}