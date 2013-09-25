var UHHId = function(_args) {
	if (!_args.ui || typeof _args.ui != 'object') {
		console.log('Error: missing loginUI');
		return null;
	}
	this.DialogModule = _args.ui.login;
	var keychain = require('com.obscure.keychain');
	this.keyitem = keychain.createKeychainItem('uhhident', 'hoffentlichnichtauffindbar');
	console.log('Info: keyitem=' + JSON.stringify(this.keyitem));
	return this;
};

UHHId.prototype.isAuth = function(_callback) {
	if (this.keyitem.account) {
		console.log('Info: uhh_name was stored, try login into cloud.');
		Ti.App.PhotoCloud.createUser(this.keyitem.account, function(_success) {
			console.log('Info: message from Ti.App.PhotoCloud.createUser: ' + _success);
			_callback(_success);
		});
	} else {
		console.log('Info: uhh_name was missing ==> show login button');
		_callback(false);
	}
};

UHHId.prototype.setAuth = function(_uhh_user) {
	console.log('Info: persisting of uhh_user');
	this.keyitem.account = _uhh_user;
	console.log(this.keyitem);
};

/** will triggered by user_window **/
UHHId.prototype.authorize = function(_callback) {
	var loginDialog = new this.DialogModule();
	var self = this;
	var doLogin = function(_e) {
		console.log('Info: -----Start UHHlogin');
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
			Ti.Android && progressIndicator.hide();
			console.log('Info: return from fkennung=' + _e.success + ' width ' + _e.user);
			if (_e.success == true) {
				console.log('Info: login FK successful');
				self.setAuth(_e.user);
				_callback && _callback({
					success : true,
					user : _e.user
				});
			} else {
				console.log('Warning: login unsuccessful');
				_callback({
					success : false
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
	console.log('Info: start login');
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
		username : _user.split(':')[0].replace(/@uni\-hamburg\.de$/, ''),
		password : _user.split(':')[1],
	});
	xhr.open("GET", 'https://uhhdisk.nds.uni-hamburg.de/oneNet/NetStorage');
	xhr.send(null);
};
module.exports = UHHId;
