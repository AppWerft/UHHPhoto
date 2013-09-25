const CLOUDUSERID = 'clouduserid', CLOUDUSERNAME = 'cloudusername', PW = 'qwertz', CLOUDACLID = 'cloudaclid';
const TABLE = 'uhhphoto';

var PhotoCloud = function() {
	this.Cloud = require('ti.cloud');
	this.cc = {// cloud credentials from storage ;-)
		"uhh_user" : undefined,
		"cloud_userid" : (Ti.App.Properties.hasProperty(CLOUDUSERID)) ? Ti.App.Properties.getString(CLOUDUSERID) : undefined,
		"cloud_username" : (Ti.App.Properties.hasProperty(CLOUDUSERNAME)) ? Ti.App.Properties.getString(CLOUDUSERNAME) : undefined,
		"cloud_aclid" : (Ti.App.Properties.hasProperty(CLOUDACLID)) ? Ti.App.Properties.getString(CLOUDACLID) : undefined,
	};
	return this;
};

PhotoCloud.prototype.createUser = function(_user, _callback) {
	var self = this;
	var cloudusername = Ti.Utils.md5HexDigest(_user);
	Ti.App.Properties.setString(CLOUDUSERNAME, this.cc['cloud_username']);
	function createACL(_callback) {
		//if (!Ti.App.Properties.hasProperty(CLOUDACLID)) {
		var options = {
			name : 'acl_' + cloudusername,
			public_read : true
		};
		console.log('Info: creating ACLid: ' + JSON.stringify(options));
		self.Cloud.ACLs.create(options, function(_e) {
			if (_e.code == 200 || _e.code == 400) {
				if (_e.success) {
					Ti.App.Properties.setString(CLOUDACLID, _e.acls[0].id);
					self.cc['cloud_aclid'] = _e.acls[0].id;
					console.log('Info: ACLid created: ' + _e.acls[0].id);
				}
				_callback(true);
			} else {
				_callback(false);
			}
		});
		//	} else {
		//		console.log('Info: we have always an ACLid ' + Ti.App.Properties.getString(ACLID));
		//		_callback(true);
		//	}
	};
	function loginUser(_callback) {
		var options = {
			login : cloudusername,
			password : PW
		};
		self.Cloud.Users.login(options, function(_e) {
			if (_e.success) {
				console.log('Login with ' + JSON.stringify(options) + ' successful ;-))');
			} else
				console.log('ERROR: Login with ' + JSON.stringify(options) + ' unsuccessful');
			_callback(_e.success);
		});
	};
	function createUser(_callback) {
		var options = {
			"username" : cloudusername,
			"password" : PW,
			"password_confirmation" : PW,
			"first_name" : "Max",
			"last_name" : "muster",
			"suppress_response_codes" : false
		};
		self.Cloud.Users.create(options, function(_e) {
			if (_e.success) {
				self.cc['cloud_userid'] = _e.users[0].id;
				Ti.App.Properties.setString(CLOUDUSERID, _e.users[0].id);
				console.log('Info: got new userid from cloud: ' + _e.users[0].id);
				loginUser(_user, function() {
				});
			} else {
				if (_e.error && _e.message) {
					//	console.log('Error :' + _e.message);
				};
			}
			_callback();
		});
		console.log('Info: try creating of ' + JSON.stringify(options));
	};
	function isInCloud(_callback) {
		this.Cloud.Users.showMe(function(_e) {
			if (_e.success)
				_callback(true);
			else
				Callback(false);
		});
	};

	/* Main loop:   */
	if (self.Cloud.sessionId) {
		console.log('Info: sessionId OK');
		_callback(true);
	} else {
		createUser(function() {
			loginUser(function(_login) {
				if (_login) {
					createACL(function(_acl) {
						console.log((_acl == true) ? 'Info: acl creating successful' : 'Warning: acl creating unsuccessful');
						_callback(_acl);
					});
				} else
					console.log('Warning: login into cloud unsuccessful');
				_callback(false);
			});
		});
	}
};

//// End of Cloud initialisation

/////////////////////////////////////////////////////////////////////////////////////////
/// Functional modules
PhotoCloud.prototype.getItemsByUser = function(_dish, _callback) {
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

PhotoCloud.prototype.getAllPhotos = function(_progress, _callback) {
	var self = this;
	_progress.show();
	self.Cloud.ondatastream = function(_e) {
		_progress.value = _e.progress;
	};
	function getPhotoURL(_item, _callback) {
		if (!_item.id) {
			console.log('Warning: no photo/id');
			return;
		}
		if (_item.url) {
			console.log('Info: image proceeded');
			_callback(_item);
		} else {
			self.Cloud.Photos.show({
				photo_id : _item.id
			}, function(_e) {
				console.log('Info: photos found for ' + _item.id);
				//	console.log('Info: answer from showPhoto: '+JSON.stringify(_e));
				if (_e.success && _e.photos) {
					_item.photo_url = _e.photos[0].urls;
					console.log('id= ' + _item.id);
					_callback && _callback(_item);
				} else {
					console.log('ERROR: ');
				}
			});
		}
	};
	this.Cloud.Photos.query({
		classname : TABLE,
		order : '-created_at'
	}, function(_e) {
		console.log(JSON.stringify(_e));
		_progress.hide();
		if (_e.success && _e.meta.total_results) {
			var photos = _e.photos;
			Ti.App.Properties.setString('allphotos', JSON.stringify(photos));
			console.log('Info: found ' + photos.length + ' photos.');
			for (var i = 0; i < photos.length; i++) {
				if (!photos[i].urls)
					getPhotoURL(photos[i]);
			}
			_callback({
				photos : photos,
				online : true
			});
		} else {
			_callback({
				photos : Ti.App.Properties.hasProperty('allphotos') ? JSON.parse(Ti.App.Properties.getString('allphotos')) : null,
				online : false
			});
		}
	});
};

/* POSTING OF COMMENT AND PHOTO */
///////////////////////////////////////////////////////////////////////////////////////////////
PhotoCloud.prototype.postPhoto = function(_args) {
	var self = this;
	_args.progress && _args.progress.show();
	var options = {
		"photo" : _args.post.photo,
		"classname" : TABLE,
		"collection_name" : TABLE,
		"title" : _args.post.title,
		"coordinates" : _args.post.coordinates,
		"custom_fields" : {
			width : _args.post.width,
			height : _args.post.height
		},
		"acl_id" : self.cc['cloud_aclid']
	};
	console.log(JSON.stringify(options));
	console.log('------------------------');
	self.Cloud.onsendstream = function(_e) {
		if (_args.progress)
			_args.progress.value = _e.progress;
		if (_args.preview)
			_args.preview.opacity = _e.progress;
	};
	self.Cloud.Photos.create(options, function(_e) {
		if (_args.progress)
			_args.progress.hide();
		if (_args.preview)
			_args.preview.hide();

		self.Cloud.ondatastream = null;
		if (_e.success) {
			if (_args.onsuccess && typeof (_args.onsuccess) == 'function')
				_args.onsuccess(_e.photos[0]);
		} else {
			if (_args.onerror && typeof (_args.onerror) == 'function')
				_args.onerror(null);
		}
	});

};

module.exports = PhotoCloud;

