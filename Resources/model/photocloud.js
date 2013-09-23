const USER = 'uhh_userid', PW = 'qwertz';
const TABLE = 'uhhphoto';

var PhotoCloud = function() {
	this.Cloud = require('ti.cloud');
	this.uhh_userid;
	this.uhh_aclid;
	return this;
};

PhotoCloud.prototype.createUser = function(_user, _callback) {
	var self = this;
	function createACL(_args, _callback) {
		if (!Ti.App.Properties.hasProperty('acl_id')) {
			this.Cloud.ACLs.create({
				name : 'acl_' + user_name,
				public_read : true
			}, function(e) {
				if (!e.error)
					Ti.App.Properties.setString('acl_id', e.acls[0].id);
			});
		}
	};
	function loginUser(_userid, _callback) {
		if (!self.Cloud.sessionId) {
			self.Cloud.Users.login({
				login : self.user_name,
				password : PW
			}, function(e) {
				if (e.success) {
					console.log('Login with ' + user_name + ' successful ;-))');
					createACL();
				} else
					console.log('ERROR: Login with ' + user_name + ' unsuccessful');
			});
		} else {
			console.log('SessionId exists');
			createACL();
		}
	};
	if (!Ti.App.Properties.hasProperty(USER)) {
		this.Cloud.Users.create({
			"username" : _user,
			"password" : PW,
			"password_confirmation" : PW,
			"first_name" : "",
			"last_name" : ""
		}, function(e) {
			if (e.success) {
				self.uhh_userid = e.users[0].id;
				Ti.App.Properties.setString(USER, self.uhh_userid);
				loginUser(self.uhh_userid);
			} else {
				if (e.error && e.message) {
					console.log('Error :' + e.message);
				}
			}
		});
	} else {
		uhh_userid = Ti.App.Properties.getString(USER);
		loginUser(uhh_userid);
	}
};


//// End of Cloud initialisation

function getPhoto(_item, _callback) {
	if (!_item.photo || !_item.photo.id)
		return;
	if (_item.photo_url)
		_callback(_item)
	else {// proccessed ?
		Cloud.Photos.show({
			photo_id : _item.photo.id
		}, function(_e) {
			if (_e.success && _e.photos) {
				_item.photo_url = _e.photos[0].urls;
				_callback(_item)
			} else {
				console.log('ERROR: ');
			}
		});
	}
}

/////////////////////////////////////////////////////////////////////////////////////////
/// Functional modules
exports.getDataByUserAndDish = function(_dish, _callback) {
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
				_callback(item)
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
exports.postComment = function(_args) {
	function postPhoto(_args) {
		if (!_args.post.photo && _args.onsuccess && typeof (_args.onsuccess) == 'function') {
			_args.onsuccess(null);
			return;
		}
		console.log(_args.post.photo);
		console.log( typeof _args.post.photo);
		Cloud.Photos.create({
			photo : _args.post.photo,
			acl_id : mensa_aclid
		}, function(e) {
			Cloud.onsendstream = Cloud.ondatastream = null;
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
		onerror : function() {
		},
		onsuccess : function(_photo) {
			console.log('onsuccess in postPhoto');
			console.log(_photo);
			if (_photo != null)
				post.photo = _photo;
			post.user_id = mensa_userid;

			if (id == null) {
				Cloud.Objects.create({
					acl_id : mensa_aclid,
					classname : TABLE,
					fields : post
				}, function(e) {
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
			} else {
				Cloud.Objects.update({
					classname : TABLE,
					id : id,
					fields : post
				}, function(_e) {
					if (_e.success) {
						if (_args.onsuccess && typeof (_args.onsuccess) == 'function')
							_args.onsuccess();
					} else {
						if (_args.onerror && typeof (_args.onerror) == 'function')
							_args.onerror();
					}
				});
			}
		}
	});
};

module.exports = PhotoCloud;
