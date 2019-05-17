// Baidu suggest
$("#input").focus();
$('.ui.search').search({
  type: 'category',
  minCharacters: 1,
	apiSettings: {
    url: 'https://www.baidu.com/sugrec?prod=pc&wd={query}',
    jsonp:'cb',
    dataType:'jsonp',
    async:true,
    onResponse: function(Response) {
      var
      response = {
        results: {}
      };
      if (!Response || !Response.g) {
        return;
      }
      $.each(Response.g, function(index, item) {
        var
          type = item.type || 'Unknown',
          maxResults = 5;
        if (index >= maxResults) {
          return false;
        }
        if (response.results[type] === undefined) {
          response.results[type] = {
            name: type  ,
            results: []
          };
        }
        response.results[type].results.push({
          title: item.q,
        });
      });
      return response;
    }
  }
});

// Add !
$('#bang').click(function () {
  document.getElementById('input').value = '!';
  $("#input").focus();
})

// Advanced 
$('.advanced a').click(function () {
  h = $(this).attr('name');
  $(".search input").val($(".search input").val() + h); // val
  $("#div").append(h);
});

// Config
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
    'b': 'https://www.baidu.com/s?wd=%s',
    'g': 'https://www.google.com/search?q=%s',
    'bt': 'https://fanyi.baidu.com/translate#auto/zh/%s',
    'gt': 'https://translate.google.com/#auto/zh-CN/%s',
    'gh': 'https://github.com/search?utf8=✓&q=%s',
    'gm': 'https://www.google.com/maps/search/%s/',
    'sf': 'https://segmentfault.com/search?q=%s',
    'so': 'https://stackoverflow.com/search?q=%s',
    'tb': 'https://s.taobao.com/search?q=%s',
    'jd': 'https://search.jd.com/Search?keyword=%s&enc=utf-8',
    'map': 'https://ditu.amap.com/search?query=%s', 
    'bilibili': 'https://www.bilibili.com/search?keyword=%s',
    'iqiyi': 'https://so.iqiyi.com/so/q_%s',
    'reddit': 'https://www.reddit.com/search?q=%s',
    'sspai': 'https://sspai.com/search/article?q=%s',
    'taobao': 'https://s.taobao.com/search?q=%s',
    'tmall': 'https://list.tmall.com/search_product.htm?q=%s',
    'twitter': 'https://twitter.com/search?q=%s',
    'v2ex': 'https://www.google.com/search?q=site:v2ex.com/t%20%s',
    'weibo': 'https://s.weibo.com/weibo/%s',
    'weixin': 'http://weixin.sogou.com/weixin?type=2&query=%s',
    'wiki': 'https://en.wikipedia.org/wiki/%s',
    'youku': 'https://so.youku.com/search_video/q_%s',
    'youtube': 'https://www.youtube.com/results?search_query=%s',
    'zhihu': 'https://www.zhihu.com/search?q=%s'
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
