$(document).ready(function () {
  // 判断窗口大小，添加输入框自动完成
  var wid = $("body").width();
  if (wid < 640) {
      $(".wd").attr('autocomplete', 'off');
  } else {
      $(".wd").focus();
  }
  // 菜单点击
    $("#menu").click(function(event) {
      $(this).toggleClass('on');
      $(".list").toggleClass('closed');
      $(".mywth").toggleClass('hidden');
  });
  $("#content").click(function(event) {
      $(".on").removeClass('on');
      $(".list").addClass('closed');
      $(".mywth").removeClass('hidden');
  });
  $("#bang").click(function(event) {
    document.getElementById("input").value = "!";
    $(".lg").toggleClass('g');
    $("#input").focus();
  });
  $("#input").autocomplete({
    appendTo: '#sou',
    maxHeight: 150,
    zIndex: 500,
    serviceUrl: "https://www.baidu.com/sugrec",
    paramName: "wd",
    deferRequestBy: 1,
    params: {
      prod: "pc",
      from: "pc_web",
      json: 1,
      sc: "eb",
      csor: 0
    },
    ajaxSettings: {
      jsonp: "cb",
      dataType: "jsonp"
    },
    onSelect: function (suggestion) {
      openQueryUrl(suggestion.value);
    },
    transformResult: function (response) {
      const result = {
        suggestions: {}
      };
      if (!response || !response.g) {
        return result;
      } else {
        return {
          suggestions: $.map(response.g, function (item) {
            return {
              value: item.q,
              data: item.sa
            };
          })
        };
      }
    }
  });

  /**
   * 注册 Service Worker
   */
  // Check that service workers are supported
  if ('serviceWorker' in navigator) {
    // Use the window load event to keep the page load performant
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js');
    });
  }
  
});

$(document).keydown(function (event) {
  if (event.keyCode == 13 || (event.altKey && window.event.keyCode == 66)) {
    const string = document.getElementById("input").value;
    if (!isEmpty(string)) {
      openQueryUrl(string);
    } else {
      return true;
    }
  } else {
    return true;
  }
});

function isEmpty(obj) {
  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
}

function openQueryUrl(string) {
  const queryString = string.split(" ");
  let queryEngine = queryString.shift();
  if (queryEngine.charAt(0) != DEFAULT_TAG) {
    queryString.unshift(queryEngine);
    queryEngine = "null";
  }
  const queryURL = makeQueryURL(getQueryEngine(queryEngine), queryString.join("%20"));
  window.open(queryURL);
  document.getElementById("input").value = "";
}

function getQueryEngine(search_engine) {
  let result = undefined;
  const array = QUERY_ENGINE;
  const engine = search_engine.substr(1);
  result = array[engine];
  if (!result) {
    result = array[DEFAULT_ENGINE];
  }
  return result;
}

function makeQueryURL(queryEngine, queryString) {
  return queryEngine.replace("%s", queryString);
}

const DEFAULT_TAG = "!";
const DEFAULT_ENGINE = "b";

const QUERY_ENGINE = {
  b: "https://www.baidu.com/s?wd=%s",
  g: "https://www.google.com/search?q=%s",
  bt: "https://fanyi.baidu.com/translate#auto/zh/%s",
  gt: "https://translate.google.com/#auto/zh-CN/%s",
  gh: "https://github.com/search?utf8=✓&q=%s",
  gm: "https://www.google.com/maps/search/%s/",
  sf: "https://segmentfault.com/search?q=%s",
  so: "https://stackoverflow.com/search?q=%s",
  tb: "https://s.taobao.com/search?q=%s",
  jd: "https://search.jd.com/Search?keyword=%s&enc=utf-8",
  map: "https://ditu.amap.com/search?query=%s",
  bilibili: "https://www.bilibili.com/search?keyword=%s",
  iqiyi: "https://so.iqiyi.com/so/q_%s",
  reddit: "https://www.reddit.com/search?q=%s",
  sspai: "https://sspai.com/search/article?q=%s",
  taobao: "https://s.taobao.com/search?q=%s",
  tmall: "https://list.tmall.com/search_product.htm?q=%s",
  twitter: "https://twitter.com/search?q=%s",
  v2ex: "https://www.google.com/search?q=site:v2ex.com/t%20%s",
  weibo: "https://s.weibo.com/weibo/%s",
  weixin: "http://weixin.sogou.com/weixin?type=2&query=%s",
  wiki: "https://en.wikipedia.org/wiki/%s",
  youku: "https://so.youku.com/search_video/q_%s",
  youtube: "https://www.youtube.com/results?search_query=%s",
  zhihu: "https://www.zhihu.com/search?q=%s"
};