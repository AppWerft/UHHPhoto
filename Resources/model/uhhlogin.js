exports.tryall = function(_user, _callback) {
	this.stinekennung(_user, _callback);
	this.fkennung(_user, _callback);
};


exports.stinekennung = function(_user, _callback) {
	var doResponse = function() {
		if (this.getResponseHeader('refresh')) {
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = doResponse;
			xhr.open("GET", HOST + this.getResponseHeader('refresh').split('URL=')[1]);
			xhr.send();
		} else {
			var regex = /<h1>Herzlich Willkommen,[\s]+(.*?)!<\/h1>/mi;
			if (regex.test(this.responseText)) {
				var name = regex.exec(this.responseText)[1];
				_callback({
					success : true,
					type : 'stine',
					title : name + '@STiNE',
					name : name
				});
			} 
		}
	};
	var postvalues = {
		APPNAME : 'CampusNet',
		ARGUMENTS : 'clino,usrname,pass,menuno',
		PRGNAME : 'LOGINCHECK',
		clino : '<!$MG_SESSIONNO>',
		menuno : '<!$MG_MENUID>',
		usrname : _user.split(':')[0],
		pass : _user.split(':')[1]
	};
	var HOST = 'https://www.stine.uni-hamburg.de';
	var xhr_getcookie = Ti.Network.createHTTPClient();
	xhr_getcookie.onload = function() {
		var xhr_postcredentials = Ti.Network.createHTTPClient({
			onload : doResponse
		});
		xhr_postcredentials.open("POST", HOST + '/scripts/mgrqispi.dll');
		xhr_postcredentials.send(postvalues);
	};
	xhr_getcookie.open("GET", HOST + '/');
	xhr_getcookie.send();
};

exports.fkennung = function(_user, _callback) {
	var xhr = Ti.Network.createHTTPClient({
		onload : function() {
			if (this.status === 200) {
				_callback({
					success : true,
					type : 'f',
					title : _user.split(':')[0] + '@NetStorage',
					name : _user.split(':')[0]
				});
			}
		},
		onerror : function() {
		},
		username : _user.split(':')[0],
		password : _user.split(':')[1],
	});
	xhr.open("GET", 'https://uhhdisk.nds.uni-hamburg.de/oneNet/NetStorage');
	xhr.send(null);
};

