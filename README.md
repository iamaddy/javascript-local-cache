# javascript-local-cache
localstorage cache javascript file    
### 利用localstorage缓存脚本文件   
简单写了一个js异步加载并缓存到localstorage中的功能，考虑了版本控制。以脚本文件的md5值作为版本号，本地localstorage版本与当前的不同就
从服务器拉取。
- 脚本的domain必须主域支持ajax请求
- 或者jsonp的方式也行，原理一样

### example
```
var url = {
	domain: 'http://xxxx.com',
	segment: '/js/'
};
new Loader(url, 
  ['pkg/module.0872bee5.lc.js',
  'pkg/gift.26e86227.lc.js',
  'pkg/bbscommon.26089ca5.lc.js',
  'pkg/widget.efb0b33f.lc.js'],
  ['/min/f=', ',']);
```
上述请求的资源会是:`http://xxxx.com/js/pkg/module.0872bee5.lc.js`，当然会进行combo请求。请求链接如下：
`http://xxx.com/min/f=/js/pkg/widget.efb0b33f.lc.js,/js/pkg/bbscommon.26089ca5.lc.js,/js/pkg/gift.26e86227.lc.js,/js/pkg/module.0872bee5.lc.js`     
     
/min/f=可以自定义。    

![](https://github.com/iamaddy/javascript-local-cache/blob/master/img/example.png)     
缓存js的意义与风险     
http://www.zhihu.com/question/28467444    

http://www.cnblogs.com/shinnychen/p/3779782.html
