var nameCookie = ["phpbb3_2cjk5_u", "phpbb3_2cjk5_sid", "phpbb3_2cjk5_sid_check", "phpbb3_2cjk5_k"], //set the name of all cookies needed
    IP = "104.20.52.28", //set osu ip in var, in case it need to be changed
    osuIP = "http://" + IP,
    state; //var state used to enable/disable the extension

chrome.storage.sync.get('state', function(data) {
  if (data.state === 'on') {
	state = true; //if extension was enable in last browser run, then enable it, else disable it
	chrome.browserAction.setIcon({
		path: '/img/icon128_On.png',
	});
  } else {
	state = false;
	chrome.browserAction.setIcon({
		path: '/img/icon128_Off.png',
	});
  }
});

//event that will fire when user clicks on extension's icon
chrome.browserAction.onClicked.addListener(function(tab) {
    //access the 'state' var value from stockage
	chrome.storage.sync.get('state', function(data) {
      if (data.state === 'on') {
        chrome.storage.sync.set({state: 'off'});
		state = false;
		chrome.browserAction.setIcon({
            path: '/img/icon128_Off.png',
        });
      } else {
        chrome.storage.sync.set({state: 'on'});
		state = true;
		chrome.browserAction.setIcon({
            path: '/img/icon128_On.png',
        });
      }
    });
});

chrome.webRequest.onHeadersReceived.addListener(function (details){
	if (state){
		var lengthd = details.responseHeaders.length; //save the length value to a var in order to save time
		for(var i=0;i<lengthd;i++){
			if (details.responseHeaders[i].name == "Set-Cookie"){
				var cookieName = details.responseHeaders[i].value.split(';')[0].split('=')[0], //cookievalue is: name=value; blablabla, take only that name=value and split it
				    cookieValue = details.responseHeaders[i].value.split(';')[0].split('=')[1];
				chrome.cookies.set({
						"name": cookieName,
						"url": "https://osu.ppy.sh",
						"value": cookieValue
				});
			}
		}
	}
}, {urls: [osuIP + '/*']},['responseHeaders']);

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
	if (state){ //check if extension if on
		if ((details.url.substring(0,19) == osuIP) || 
		(details.url.substring(0,20) == osuIPs)){
			details.requestHeaders.push({
				name: 'Host',
				value: 'osu.ppy.sh'
			});
		}
		return { requestHeaders: details.requestHeaders };
	}
}, {urls: [osuIP + "/*"]},['requestHeaders','blocking']);

chrome.webRequest.onBeforeRequest.addListener(function (details) {
	if (state){ //check if extension if on
		if (details.url.substring(0,5) == "https"){
			var size = 5, //if url starts with https
			oDomain = "https://osu.ppy.sh" //set osu domain
		} else { 
			var size = 4, //if url starts with http
			oDomain = "http://osu.ppy.sh"
		}
		size += 13; //add ://osu.ppy.sh size
		
		var urlEnd = details.url.substring(size, details.url.length), // take all the url after osu.ppy.sh
		    lengthc = nameCookie.length; //save the length value to a var in order to save time
		for (var i=0;i<lengthc;i++){
			getCookies("https://osu.ppy.sh", nameCookie[i], function(cookie){
				//get cookies from "osu.ppy.sh"
				if (cookie !== null){
					//if the cookie exist, create it on osu!website ip
					chrome.cookies.set({
						"name": cookie.name,
						"url": osuIP,
						"value": cookie.value // + "ulikethememes"
					});
				}
			});
		}
		redir = ((urlEnd == '/') || (urlEnd == "")) ? '' : urlEnd;
		
		return { redirectUrl: (osuIP + redir) };
	}
}, {urls: ['http://osu.ppy.sh/*', 'https://osu.ppy.sh/*']}, ['blocking']);



function getCookies(domain, name, callback) {
	chrome.cookies.get({"url": domain, "name": name}, function(cookie){
		if(callback){
			callback(cookie);
		}
	});
}