(function (global) {
	function Loader(baseUrl, moduleList, comboSyntax){
		this.version = {};
		this.joiner = '.';
		this.needDownModule = {};
		this.baseUrl = baseUrl;
		this.defaultSyntax = comboSyntax || ["??", ","];
		this.initData(moduleList);
		this.init();
	}

	Loader.prototype = {
		constructor: Loader,
		_maxRetry: 1,
		_retry: true,
		initData:function(moduleList){
			var item;
			for (var i = moduleList.length - 1; i >= 0; i--) {
				item = moduleList[i];
				this.version[item.split(this.joiner)[0]] = {currentVersion: item.split(this.joiner)[1], path: item};
			}
		},
		init: function(){
			var _this = this;
			var requestUrl = this.makeComboUrl();
			if(!requestUrl) return;
			this.fetchAjax(requestUrl, function(data){
				if(!data) return;
				data = _this.splitCombo(data);
				if(!data || data.length !== _this.needDownFiles.length) return;
				var i = 0;
				for(var module in _this.needDownModule){
					if(_this.useScriptCode(_this.version[module].path, data[i])){
						_this.setStorage(module, {
							md5: _this.version[module].currentVersion,
							code: data[i]
						});
					}else{

					}
					i++;
				}
			});
		},
		setStorage: function(key, val, retry){
			retry = typeof retry === "undefined" ? this._retry : retry;
            try{
                localStorage.setItem(key, JSON.stringify(val));
            }catch(e){
                if (retry){
                    var max = this._maxRetry;
                    while (max > 0) {
                        max--;
                        this.set(key, val, false);
                    }
                }
            }
		},
		getStorage: function(key, parseFlag){
			var val;
            try{
                val = localStorage.getItem(key);
            }catch(e){
                return undefined;
            }
            if(val && val.charAt(0) === '"'){
                try{
                    return JSON.parse(val);
                } catch(e){
                    return val;
                }
            }else if (parseFlag){
                return JSON.parse(val);
            }else{
                return val;
            }
		},
		filterJavascriptFiles: function(){
			var needGetModuleList = [];
			for(var module in this.version){
				var model = this.version[module];
				var cached = this.getStorage(module, 1);
				model.lastVersion = cached ? cached.md5 : -1;
				if(model.currentVersion === model.lastVersion && cached && this.useScriptCode(model.path, cached.code)){
					// report(1);
				}else{
					needGetModuleList.push(this.baseUrl.segment + model.path);
					this.needDownModule[module] = this.version[module];
				}
			}
			return needGetModuleList;
		},
		useScriptCode: function(url, code){
			if(!code || !/\S/.test(code)) return false;

            if (/\.css(?:\?|$)/i.test(url)) {
                var doc = document, node = doc.createElement("style");
                doc.getElementsByTagName("head")[0].appendChild(node);
                node.styleSheet ? node.styleSheet.cssText = code 
                				: node.appendChild(doc.createTextNode(code));
            }else{
            	try{
                    var _code = code + "\r\n//@ sourceURL=" + url;
                    window.execScript ? window.execScript.call(window, _code) 
                    				  : window["eval"].call(window, _code);
                }catch(e){
                    if(!e) return true;
                    if(e.message) {
                        var msg = e.message;
                        if (msg.indexOf && msg.indexOf("Unexpected") >= 0) {
                            // TODO errReport
                            return false;
                        }
                    }
                    if(e.stack){
                    	// errReport("CacheErr(use)::" + e.stack)
                    }
                }
            }   
        	return true
		},
		splitCombo: function(code) {
			if(!code || !/\S/.test(code)) return false;
	        code = this.removeComments(code);
	        return code.match(/(!!\(function\(\)\{\s*define\([\s\S]*?\)*}\)\(undefined\);?)/g);
	    },
	    removeComments: function(code) {
	        return code.replace(/try\{\(function\(_w\)\{_w\._javascript_file_map.*?catch\(ign\)\{\};?/mg, "").replace(/\/\*\s*\|xGv00\|.*?\*\//mg, 
	        "").replace(/^\s*\/\*[\s\S]*?\*\//mg, "").replace(/^\s*\/\/.*$/mg, "")
	    },
		makeComboUrl: function(){
			var list = this.needDownFiles = this.filterJavascriptFiles();
			return list.length ? this.baseUrl.domain + this.defaultSyntax[0] + list.join(this.defaultSyntax[1]) : "";
		},
		jsonpRequest: function(){
			var script = document.createElement('script');
			script.type = 'text/javascript';
		},
		fetchAjax: function(url, callback) {
	        var xhr = new window.XMLHttpRequest;
	        var timer = setTimeout(function() {
	            xhr.abort();
	            callback(null)
	        }, 3E4);
	        xhr.open("GET", url, true);
	        xhr.onreadystatechange = function() {
	            if (xhr.readyState === 4) {
	                clearTimeout(timer);
	                if (xhr.status === 200){
	                	callback(xhr.responseText);
	                }else{
	                	callback(null);
	                }
	            }
	        };
	        xhr.send(null);
	    }
	};
	global.Loader = Loader;
})(window);