const SUGGEST_API = "https://www.baidu.com/sugrec";
const GOOGLE_SUGGEST_API = "https://suggestqueries.google.com/complete/search";
const SUGGEST_LIMIT = 8;
const SUGGEST_DEBOUNCE_MS = 120;

let suggestLayer = null;
let suggestions = [];
let activeSuggestionIndex = -1;
let suggestTimer = null;
let latestRequestId = 0;
let activeEngineTag = "b";

document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const input = document.getElementById("input");
  const menu = document.getElementById("menu");
  const list = document.querySelector(".list");
  const content = document.getElementById("content");
  const bang = document.getElementById("bang");
  const lg = document.querySelector(".lg");
  const sou = document.getElementById("sou");
  const form = sou ? sou.querySelector("form") : null;

  if (!input) {
    return;
  }

  if (lg && lg.classList.contains("g")) {
    activeEngineTag = "g";
  }

  suggestLayer = createSuggestLayer();
  if (sou && suggestLayer) {
    sou.appendChild(suggestLayer);
  }

  if (body.clientWidth < 640) {
    input.setAttribute("autocomplete", "off");
  } else {
    input.focus();
  }

  if (menu && list) {
    menu.addEventListener("click", function () {
      menu.classList.toggle("on");
      list.classList.toggle("closed");
    });
  }

  if (content && menu && list) {
    content.addEventListener("click", function () {
      menu.classList.remove("on");
      list.classList.add("closed");
    });
  }

  if (bang && lg) {
    bang.addEventListener("click", function () {
      lg.classList.toggle("g");
      activeEngineTag = lg.classList.contains("g") ? "g" : "b";
      setEnginePrefix(input, activeEngineTag);
      input.focus();
      requestSuggestions(input.value);
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!isEmpty(input.value)) {
        openQueryUrl(input.value);
      }
    });
  }

  input.addEventListener("input", function () {
    if (suggestTimer) {
      clearTimeout(suggestTimer);
    }
    suggestTimer = setTimeout(function () {
      requestSuggestions(input.value);
    }, SUGGEST_DEBOUNCE_MS);
  });

  input.addEventListener("keydown", function (event) {
    if (!suggestions.length) {
      if (event.key === "Enter" && !isEmpty(input.value)) {
        openQueryUrl(input.value);
        event.preventDefault();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestions.length;
      syncSuggestionActive();
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowUp") {
      activeSuggestionIndex = activeSuggestionIndex <= 0 ? suggestions.length - 1 : activeSuggestionIndex - 1;
      syncSuggestionActive();
      event.preventDefault();
      return;
    }

    if (event.key === "Enter") {
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        openQueryUrl(getSuggestionSearchText(suggestions[activeSuggestionIndex]));
      } else if (!isEmpty(input.value)) {
        openQueryUrl(input.value);
      }
      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  input.addEventListener("blur", function () {
    setTimeout(hideSuggestions, 120);
  });

  document.addEventListener("click", function (event) {
    if (!sou || !sou.contains(event.target)) {
      hideSuggestions();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.altKey && (event.key === "b" || event.key === "B")) {
      if (!isEmpty(input.value)) {
        openQueryUrl(input.value);
      }
    }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js");
    });
  }
});

function createSuggestLayer() {
  const layer = document.createElement("div");
  layer.className = "autocomplete-suggestions";
  layer.style.display = "none";
  layer.setAttribute("role", "listbox");
  return layer;
}

function requestSuggestions(rawValue) {
  const input = document.getElementById("input");
  if (!input) {
    return;
  }
  const keyword = extractKeywordForSuggest(rawValue);
  if (!keyword) {
    hideSuggestions();
    return;
  }

  latestRequestId += 1;
  const requestId = latestRequestId;
  fetchSuggest(keyword)
    .then(function (items) {
      if (requestId !== latestRequestId) {
        return;
      }
      suggestions = items.slice(0, SUGGEST_LIMIT);
      activeSuggestionIndex = -1;
      renderSuggestions(input);
    })
    .catch(function () {
      if (requestId === latestRequestId) {
        hideSuggestions();
      }
    });
}

function fetchSuggest(keyword) {
  const suggestProvider = getSuggestProvider();
  if (suggestProvider === "google") {
    return fetchGoogleSuggest(keyword);
  }
  return fetchBaiduSuggest(keyword);
}

function fetchBaiduSuggest(keyword) {
  const params = new URLSearchParams({
    wd: keyword,
    prod: "pc",
    from: "pc_web",
    json: "1",
    sc: "eb",
    csor: "0"
  });
  return jsonp(`${SUGGEST_API}?${params.toString()}`, "cb", 5000).then(function (response) {
    if (!response || !Array.isArray(response.g)) {
      return [];
    }
    return response.g
      .map(function (item) {
        return item && item.q ? item.q : "";
      })
      .filter(Boolean);
  });
}

function fetchGoogleSuggest(keyword) {
  const params = new URLSearchParams({
    client: "chrome",
    q: keyword
  });
  return jsonp(`${GOOGLE_SUGGEST_API}?${params.toString()}`, "callback", 5000).then(function (response) {
    if (!Array.isArray(response) || !Array.isArray(response[1])) {
      return [];
    }
    return response[1].filter(function (item) {
      return typeof item === "string" && item.length > 0;
    });
  });
}

function jsonp(url, callbackParamName, timeoutMs) {
  return new Promise(function (resolve, reject) {
    const callbackName = `__ys_suggest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let settled = false;

    function cleanup() {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }
    }

    const timer = setTimeout(function () {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new Error("Suggestion request timeout"));
    }, timeoutMs);

    window[callbackName] = function (data) {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      cleanup();
      resolve(data);
    };

    script.src = `${url}&${callbackParamName}=${callbackName}`;
    script.async = true;
    script.referrerPolicy = "no-referrer";
    script.onerror = function () {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(new Error("Suggestion request failed"));
    };

    document.body.appendChild(script);
  });
}

function renderSuggestions(input) {
  if (!suggestLayer) {
    return;
  }
  suggestLayer.innerHTML = "";

  if (!suggestions.length) {
    hideSuggestions();
    return;
  }

  suggestions.forEach(function (suggestion, index) {
    const item = document.createElement("div");
    item.className = "autocomplete-suggestion";
    item.textContent = suggestion;
    item.setAttribute("role", "option");
    item.addEventListener("mouseenter", function () {
      activeSuggestionIndex = index;
      syncSuggestionActive();
    });
    item.addEventListener("mousedown", function (event) {
      event.preventDefault();
      openQueryUrl(getSuggestionSearchText(suggestion));
    });
    suggestLayer.appendChild(item);
  });

  suggestLayer.style.display = "block";
  input.setAttribute("aria-expanded", "true");
}

function syncSuggestionActive() {
  if (!suggestLayer) {
    return;
  }
  const children = suggestLayer.children;
  for (let i = 0; i < children.length; i += 1) {
    if (i === activeSuggestionIndex) {
      children[i].classList.add("autocomplete-selected");
    } else {
      children[i].classList.remove("autocomplete-selected");
    }
  }
}

function hideSuggestions() {
  const input = document.getElementById("input");
  suggestions = [];
  activeSuggestionIndex = -1;
  if (suggestLayer) {
    suggestLayer.style.display = "none";
    suggestLayer.innerHTML = "";
  }
  if (input) {
    input.setAttribute("aria-expanded", "false");
  }
}

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
  window.open(queryURL, "_blank", "noopener,noreferrer");
  const input = document.getElementById("input");
  if (input) {
    input.value = "";
  }
}

function getQueryEngine(search_engine) {
  let result = undefined;
  const array = QUERY_ENGINE;
  const engine = search_engine.substr(1);
  result = array[engine];
  if (!result) {
    result = array[getDefaultEngine()];
  }
  return result;
}

function makeQueryURL(queryEngine, queryString) {
  return queryEngine.replace("%s", queryString);
}

const DEFAULT_TAG = "!";
const DEFAULT_ENGINE = "b";

function getDefaultEngine() {
  return activeEngineTag || DEFAULT_ENGINE;
}

function getSuggestProvider() {
  return getDefaultEngine() === "g" ? "google" : "baidu";
}

function extractKeywordForSuggest(rawValue) {
  const text = (rawValue || "").trim();
  if (!text) {
    return "";
  }
  if (text.charAt(0) !== DEFAULT_TAG) {
    return text;
  }
  const parts = text.split(/\s+/);
  if (parts.length <= 1) {
    return "";
  }
  return parts.slice(1).join(" ");
}

function getSuggestionSearchText(suggestion) {
  const input = document.getElementById("input");
  if (!input) {
    return suggestion;
  }
  const text = (input.value || "").trim();
  if (text.charAt(0) === DEFAULT_TAG) {
    const command = text.split(/\s+/)[0];
    return `${command} ${suggestion}`;
  }
  return `${DEFAULT_TAG}${getDefaultEngine()} ${suggestion}`;
}

function setEnginePrefix(input, engineTag) {
  const current = (input.value || "").trim();
  const keyword = extractKeywordForSuggest(current);
  input.value = keyword ? `${DEFAULT_TAG}${engineTag} ${keyword}` : `${DEFAULT_TAG}${engineTag}`;
}

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
