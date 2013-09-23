var UHHId = function(_args) {
	if (!_args.ui || typeof _args.ui != 'object') {
		console.log('Error: missing loginUI');
		return null;
	}
	this.DialogModule = _args.ui.login;
	var keychain = require('com.obscure.keychain');
	this.keyitem = keychain.createKeychainItem('uhhident', 'hoffentlichnichtauffindbar');
	console.log(this.keyitem);
	return this;
};

UHHId.prototype.isAuth = function() {
	return (this.keyitem.account) ? true : false;
};

UHHId.prototype.setAuth = function(_userid) {
	Ti.App.PhotoCloud.loginUser(_userid);
	this.keyitem.account = _userid;
};

/** will triggered by user_window **/
UHHId.prototype.authorize = function(_callback) {
	var loginDialog = new this.DialogModule();
	var self = this;
	var doLogin = function(_e) {
		var user = _e.user.split(':')[0];
		var password = _e.user.split(':')[1];
		if (Ti.Network.online == false || user.length < 3 || password.length < 3) {
			console.log('Info: offline or creds to short');
			_callback({
				success : false
			});
			return false;
		}
		loginDialog.removeEventListener('login', doLogin);
		if (Ti.Android) {
			console.log('Info: progress created');
			var progressIndicator = Ti.UI.Android.createProgressIndicator({
				message : 'Loading...',
				location : Ti.UI.Android.PROGRESS_INDICATOR_DIALOG,
				type : Ti.UI.Android.PROGRESS_INDICATOR_DETERMINANT,
				cancelable : false,
				min : 0,
				max : 1
			});
			progressIndicator.show();
		}
		tryFKennung(_e.user, progressIndicator || null, function(_e) {
			Ti.Android && progressIndicator.hide()
			if (_e.success == false) {
				console.log('Warning: login unsuccessful');
				_callback({
					success : false
				});
			}
			if (_e.success == true) {
				console.log('Info: login successful');
				self.setAuth(_e.user);
				_callback({
					success : true,
					user : _e.user

				});
			}
		});
	};
	console.log('Info: authorizing started');
	/*if (this.isAuth()) {
	 console.log('Info: was authorized');
	 _callback({
	 success : true
	 });
	 return;
	 }*/
	loginDialog.show();
	loginDialog.addEventListener('login', doLogin);
	console.log('Info: start login45');
};

var trySTiNEkennung = function(_user, _callback) {
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
					user : name
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

var tryFKennung = function(_user, _progress, _callback) {
	var xhr = Ti.Network.createHTTPClient({
		ondatastream : function(_e) {
			if (_progress)
				_progress.value = _e.progress;
		},
		onload : function() {
			if (this.status === 200) {
				_callback({
					success : true,
					type : 'f',
					title : _user.split(':')[0] + '@NetStorage',
					user : _user.split(':')[0]
				});
			}
		},
		onerror : function() {
			_callback({
				success : false
			});
		},
		username : _user.split(':')[0],
		password : _user.split(':')[1],
	});
	xhr.open("GET", 'https://uhhdisk.nds.uni-hamburg.de/oneNet/NetStorage');
	xhr.send(null);
};
module.exports = UHHId;
