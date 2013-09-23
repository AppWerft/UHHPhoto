const CLOUDUSERID = 'uhh_userid', PW = 'qwertz', ACLID = 'aclid';
const TABLE = 'uhhphoto';

var PhotoCloud = function() {
	this.Cloud = require('ti.cloud');
	this.uhh_user = undefined;
	this.cloud_userid = Ti.App.Properties.getString(CLOUDUSERID);
	this.cloud_aclid = undefined;
	return this;
};

PhotoCloud.prototype.createUser = function(_user, _callback) {
	var self = this;
	function createACL(_user, _callback) {
		if (!Ti.App.Properties.hasProperty(ACLID)) {
			var options = {
				name : 'acl_' + _user,
				public_read : true
			};
			console.log('Info: creating ACLid: ' + JSON.stringify(options));
			self.Cloud.ACLs.create(options, function(_e) {
				if (!_e.error) {
					Ti.App.Properties.setString(ACLID, _e.acls[0].id);
					console.log('Info: ACLid created: ' + _e.acls[0].id);
				} else {
					console.log(_e);
				}
			});
		}
		console.log('Info: we have always an ACLid ' + Ti.App.Properties.getString(ACLID));
	};
	function loginUser(_user, _callback) {
		if (!self.Cloud.sessionId) {// Variable in Cloud
			var options = {
				login : Ti.Utils.md5HexDigest(_user),
				password : PW
			};
			console.log('Info: sessionId missing ==> login as ' + JSON.stringify(options));
			self.Cloud.Users.login(options, function(_e) {
				if (_e.success) {
					console.log('Login with ' + JSON.stringify(options) + ' successful ;-))');
					createACL(_user);
				} else
					console.log('ERROR: Login with ' + JSON.stringify(options) + ' unsuccessful');
			});
		} else {
			console.log('Info: sessionId already exists');
			createACL(_user);
		}
	};
	// creating of Cloud user:
	if (!Ti.App.Properties.hasProperty(CLOUDUSERID)) {
		console.log('Info: no CLOUDUSERID => creating one');
		var options = {
			"username" : Ti.Utils.md5HexDigest(_user),
			"password" : PW,
			"password_confirmation" : PW,
			"first_name" : "",
			"last_name" : ""
		};
		console.log('Info: no CLOUDUSERID => creating one width ' + JSON.stringify(options));
		this.Cloud.Users.create(options, function(_e) {
			console.log(_e);
			if (_e.success) {
				self.cloud_userid = _e.users[0].id;
				Ti.App.Properties.setString(CLOUDUSERID, self.cloud_userid);
				console.log('Info: got new userid from cloud: ' + _e.users[0].id);
				loginUser(_user, function() {
				});
			} else {
				if (_e.error && _e.message) {
					console.log('Error :' + _e.message);
				}_
			}
		});
		console.log('Info: creating of ' + JSON.stringify(options));
	} else {
		this.cloud_userid = Ti.App.Properties.getString(CLOUDUSERID);
		console.log('Info: user (' + this.cloud_userid + ') always exists, only login into cloud.');
		loginUser(_user, function() {
		});
	}
};

//// End of Cloud initialisation

function getPhoto(_item, _callback) {
	if (!_item.photo || !_item.photo.id)
		return;
	if (_item.photo_url)
		_callback(_item);
	else {// proccessed ?
		Cloud.Photos.show({
			photo_id : _item.photo.id
		}, function(_e) {
			if (_e.success && _e.photos) {
				_item.photo_url = _e.photos[0].urls;
				_callback(_item);
			} else {
				console.log('ERROR: ');
			}
		});
	}
};

/////////////////////////////////////////////////////////////////////////////////////////
/// Functional modules
PhotoCloud.prototype.getDataByUserAndDish = function(_dish, _callback) {
	Cloud.Objects.query({
		classname : TABLE,
		where : {
			user_id : mensa_userid,
			dish : _dish
		}
	}, function(e) {
		if (e.success && e.meta.total_results) {
			console.log('===getDataByUserAndDish======');
			var item = e.mensa[0];
			if (!item.photo) {// without photo
				_callback(item);
			} else {
				getPhoto(item, _callback);
			};
		} else {
			console.log('===nothing found======');
			_callback(null);
		}
	});
};

exports.getDataByDishes = function(_dish, _callback) {
	Cloud.Objects.query({
		classname : TABLE,
		where : {
			dish : _dish
		}
	}, function(e) {
		if (e.success && e.meta.total_results) {
			for (var i = 0; i < e.mensa.length; i++) {
				getPhoto(e.mensa[i], function(_item) {
					_callback(_item.photo_url);
				});
			}

		} else {
			_callback(null);
		}
	});
};

exports.getVoting = function(_dish, _callback) {
	var bar = parseInt(Ti.Utils.md5HexDigest(_dish).replace(/[\D]+/g, '').substr(0, 3)) % 7;
	if (!bar)
		bar = 2;
	_callback(bar);
};

/* POSTING OF COMMENT AND PHOTO */
///////////////////////////////////////////////////////////////////////////////////////////////
PhotoCloud.prototype.postItem = function(_args) {
	var self = this;
	function postPhoto(_args) {
		if (!_args.post.photo && _args.onsuccess && typeof (_args.onsuccess) == 'function') {
			_args.onsuccess(null);
			return;
		}
		console.log(_args.post.photo);
		console.log( typeof _args.post.photo);
		self.Cloud.Photos.create({
			photo : _args.post.photo,
			acl_id : self.cloud_aclid
		}, function(e) {
			self.Cloud.onsendstream = self.Cloud.ondatastream = null;
			console.log('===create Photo======');
			console.log(e);
			if (e.success) {
				if (_args.onsuccess && typeof (_args.onsuccess) == 'function')
					_args.onsuccess(e.photos[0]);
			} else {
				if (_args.onerror && typeof (_args.onerror) == 'function')
					_args.onerror(null);
			}
		});
	};
	// Code start:
	console.log('POSTING start');
	var post = _args.post, id = _args.id;
	postPhoto({
		post : post,
		onerror : function(_e) {
			console.log(_e);
		},
		onsuccess : function(_photo) {
			console.log('Info: onsuccess in postPhoto');
			console.log('Info: callback from posting: ' + JSON.stringify(_photo));
			if (_photo != null) {
				post.photo = _photo;
			}
			post.user_id = self.cloud_userid;
			var options = {
				acl_id : self.cloud_aclid,
				classname : TABLE,
				fields : post
			};
			self.Cloud.Objects.create(options, function(e) {
				if (e.success) {
					if (_args.onsuccess && typeof (_args.onsuccess) == 'function')
						_args.onsuccess();
				} else {
					if (_args.onerror && typeof (_args.onerror) == 'function')
						_args.onerror();
					else
						console.log('no callback');
				}
			});
		}
	});
};

module.exports = PhotoCloud;
