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
	var cloudusername = Ti.Utils.md5HexDigest(_user + 'xyz');
	Ti.App.Properties.setString(CLOUDUSERNAME, this.cc['cloud_username']);
	function createACL(_callback) {
		if (!Ti.App.Properties.hasProperty(CLOUDACLID)) {
			var options = {
				name : 'acl_' + _cloudusername,
				public_read : true
			};
			console.log('Info: creating ACLid: ' + JSON.stringify(options));
			self.Cloud.ACLs.create(options, function(_e) {
				if (!_e.error) {
					Ti.App.Properties.setString(CLOUDACLID, _e.acls[0].id);
					self.cc['cloud_aclid'] = _e.acls[0].id;
					console.log('Info: ACLid created: ' + _e.acls[0].id);
					callback(true);
				} else {
					console.log(_e);
					callback();
				}
			});
		}
		console.log('Info: we have always an ACLid ' + Ti.App.Properties.getString(ACLID));
		_callback(true);
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
				Ti.App.Properties.setString(CLOUDUSERID, self.cc['cloud_userid']);
				console.log('Info: got new userid from cloud: ' + _e.users[0].id);
				loginUser(_user, function() {
				});
			} else {
				if (_e.error && _e.message) {
					console.log('Error :' + _e.message);
				};
			}
			_callback();
		});
		console.log('Info: creating of ' + JSON.stringify(options));
	};
	if (self.Cloud.sessionId) {
		console.log('Info: sessionId OK');
		_callback({
			success : true
		});
	} else {
		createUser(function() {
			loginUser(function() {
				createACL(_callback());
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

PhotoCloud.prototype.getAllPhotos = function(_callback) {
	var self = this;
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
				console.log(JSON.stringify(_e));
				if (_e.success && _e.photos) {
					_item.photo_url = _e.photos[0].urls;
					console.log('id= ' + _item.id + ' url= ' + _item.photo_url);
					_callback(_item);
				} else {
					console.log('ERROR: ');
				}
			});
		}
	};
	this.Cloud.Objects.query({
		classname : TABLE
	}, function(_e) {
		if (_e.success && _e.meta.total_results) {
			var photos = _e.uhhphoto;
			console.log(photos[0]);
			for (var i = 0; i < photos.length; i++) {
				getPhotoURL(photos[i], function() {
				});
			}
			_callback(photos);
		} else {
			_callback(null);
		}
	});
};

/* POSTING OF COMMENT AND PHOTO */
///////////////////////////////////////////////////////////////////////////////////////////////
PhotoCloud.prototype.postPhoto = function(_args) {
	var self = this;
	function postPhoto(_args) {
		if (_args.progress)
			_args.progress.show();
		/*if (!_args.post.photo && _args.onsuccess && typeof (_args.onsuccess) == 'function') {
		 _args.onsuccess(null);
		 return;
		 }*/
		var options = {
			photo : _args.post.photo,
			acl_id : self.cc['cloud_aclid']
		};
		console.log(JSON.stringify(options));
		console.log('------------------------');
		self.Cloud.onsendstream = function(_e) {
			console.log(_e.progress);
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
			console.log(_e);
			console.log(self.cloud_aclid);

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
	// first the only photo, then the other parts:
	postPhoto({
		post : _args.post, // still without photp
		progress : _args.progress,
		preview : _args.preview,
		onerror : function(_e) {
			console.log(_e);
		},
		onsuccess : function(_photo) {
			console.log('Info: onsuccess in postPhoto');
			console.log('Info: callback from posting: ' + JSON.stringify(_photo));
			if (_photo != null) {
				_args.post.photo = _photo;
			}
			//			post.user_id = self.cc['cloud_userid'];
			var options = {
				acl_id : self.cc['cloud_aclid'],
				classname : TABLE,
				fields : post
			};
			console.log(JSON.stringify(options));
			self.Cloud.Objects.create(options, function(e) {
				if (e.success) {
					if (_args.onsuccess && typeof (_args.onsuccess) == 'function')
						_args.onsuccess();
				} else {
					if (_args.onerror && typeof (_args.onerror) == 'function')
						_args.onerror();
					else
						console.log('Error: no callback');
				}
			});
		}
	});
};

module.exports = PhotoCloud;

var foo = {
	"photo" : {
		"bubbleParent" : true,
		"nativePath" : "file:///storage/emulated/0/dcim/Camera/UHHPhoto/tia-679963069.jpg",
		"type" : 1,
		"file" : {
			"hidden" : false,
			"nativePath" : "file:///storage/emulated/0/dcim/Camera/UHHPhoto/tia-679963069.jpg",
			"writable" : true,
			"executable" : false,
			"parent" : {
				"hidden" : false,
				"nativePath" : "file:///storage/emulated/0/dcim/Camera/UHHPhoto",
				"writable" : true,
				"executable" : false,
				"parent" : {
					"hidden" : false,
					"nativePath" : "file:///storage/emulated/0/dcim/Camera",
					"writable" : true,
					"executable" : false,
					"parent" : {
						"hidden" : false,
						"nativePath" : "file:///storage/emulated/0/dcim",
						"writable" : true,
						"executable" : false,
						"parent" : {
							"hidden" : false,
							"nativePath" : "file:///storage/emulated/0",
							"writable" : true,
							"executable" : false,
							"parent" : {
								"hidden" : false,
								"nativePath" : "file:///storage/emulated",
								"writable" : false,
								"executable" : false,
								"parent" : {
									"hidden" : false,
									"nativePath" : "file:///storage",
									"writable" : false,
									"executable" : false,
									"parent" : {
										"hidden" : false,
										"nativePath" : "file:///",
										"writable" : false,
										"executable" : false,
										"parent" : null,
										"readonly" : true,
										"directoryListing" : ["sdcard", "firmware", "persist", "storage", "config", "cache", "acct", "vendor", "d", "etc", "mnt", "ueventd.rc", "ueventd.mako.rc", "system", "sys", "sepolicy", "seapp_contexts", "sbin", "res", "property_contexts", "proc", "init.usb.rc", "init.trace.rc", "init.rc", "init.mako.usb.rc", "init.mako.rc", "init", "fstab.mako", "file_contexts", "default.prop", "data", "charger", "root", "dev"],
										"size" : 0,
										"name" : "",
										"symbolicLink" : false,
										"bubbleParent" : true
									},
									"readonly" : true,
									"directoryListing" : ["sdcard0", "emulated"],
									"size" : 0,
									"name" : "storage",
									"symbolicLink" : false,
									"bubbleParent" : true
								},
								"readonly" : true,
								"directoryListing" : ["legacy", "0"],
								"size" : 80,
								"name" : "emulated",
								"symbolicLink" : false,
								"bubbleParent" : true
							},
							"readonly" : false,
							"directoryListing" : ["Android", "Music", "Podcasts", "Ringtones", "Alarms", "Notifications", "Pictures", "Movies", "Download", "DCIM", "panoramas", "de.appwerft.xenocanto", "de.appwerft.naturlotse", "de.appwerft.uhhap", "de.appwerft.l2g", "de.appwerft.webmontag", "media", "de.appwerft.uhhphoto"],
							"size" : 4096,
							"name" : "0",
							"symbolicLink" : false,
							"bubbleParent" : true
						},
						"readonly" : false,
						"directoryListing" : ["Camera", "100ANDRO"],
						"size" : 4096,
						"name" : "dcim",
						"symbolicLink" : false,
						"bubbleParent" : true
					},
					"readonly" : false,
					"directoryListing" : ["IMG_19700727_224508.jpg", "IMG_19700727_224529.jpg", "IMG_19700727_224539.jpg", "thumbnails", "IMG_19700727_235938.jpg", "IMG_19700727_235951.jpg", "IMG_19700728_000006.jpg", "IMG_19700728_000419.jpg", "IMG_19700728_133447.jpg", "IMG_20130825_134040.jpg", "PANO_20130825_134100.jpg", "PANO_20130825_134111.jpg", "IMG_20130825_134205.jpg", "IMG_20130825_134220.jpg", "IMG_20130825_134321.jpg", "IMG_20130825_181842.jpg", "IMG_20130827_200829.jpg", "IMG_20130831_125739.jpg", "IMG_20130831_194503.jpg", "IMG_20130831_194704.jpg", "IMG_20130831_194714.jpg", "IMG_20130831_194715.jpg", "IMG_20130831_194805.jpg", "IMG_20130831_194809.jpg", "IMG_20130831_194818.jpg", "IMG_20130831_194845.jpg", "IMG_20130831_194857.jpg", "IMG_20130831_194859.jpg", "IMG_20130831_202610.jpg", "IMG_20130831_202616.jpg", "IMG_20130831_202618.jpg", "IMG_20130831_202838.jpg", "IMG_20130831_202841.jpg", "IMG_20130831_203134.jpg", "IMG_20130831_203139.jpg", "IMG_20130831_203205.jpg", "IMG_20130831_203215.jpg", "IMG_20130831_203227.jpg", "IMG_20130910_193817.jpg", "IMG_20130911_110116.jpg", "IMG_20130914_124045.jpg", "UHHPhoto"],
					"size" : 4096,
					"name" : "Camera",
					"symbolicLink" : false,
					"bubbleParent" : true
				},
				"readonly" : false,
				"directoryListing" : ["tia-1646388961.jpg", "tia-2112840108.jpg", "tia-296659316.jpg", "tia814528621.jpg", "tia568431185.jpg", "tia1558085767.jpg", "tia895603111.jpg", "tia1566253960.jpg", "tia-679963069.jpg"],
				"size" : 4096,
				"name" : "UHHPhoto",
				"symbolicLink" : false,
				"bubbleParent" : true
			},
			"readonly" : false,
			"directoryListing" : [],
			"size" : 2439318,
			"name" : "tia-679963069.jpg",
			"symbolicLink" : false,
			"bubbleParent" : true
		},
		"height" : 3264,
		"length" : 2439318,
		"text" : null,
		"width" : 2448,
		"mimeType" : "image/jpeg"
	}
};

var bar = {
	"photos" : [{
		"id" : "5240881d931fe90af4001756",
		"filename" : "tixhr40034881.jpeg",
		"size" : 1842161,
		"md5" : "63b1d079b9ddb479ee2066159e5709e0",
		"created_at" : "2013-09-23T18:27:41+0000",
		"updated_at" : "2013-09-23T18:27:41+0000",
		"processed" : false,
		"acls" : {
			"id" : "5240586f6f27b60b03053457",
			"name" : "acl_f6sv005",
			"created_at" : "2013-09-23T15:04:15+0000",
			"updated_at" : "2013-09-23T15:04:15+0000",
			"user" : {
				"id" : "5240586e2ada000b3a053247",
				"created_at" : "2013-09-23T15:04:14+0000",
				"updated_at" : "2013-09-23T15:04:15+0000",
				"external_accounts" : [],
				"confirmed_at" : "2013-09-23T15:04:14+0000",
				"username" : "29fe7083a4b110aac1bb0d0e23822e8e",
				"admin" : "false"
			},
			"public_read" : true,
			"public_write" : false,
			"writers" : ["5240586e2ada000b3a053247"]
		},
		"user" : {
			"id" : "52407620a508bb0b0a05efaa",
			"first_name" : "Max",
			"last_name" : "muster",
			"created_at" : "2013-09-23T17:10:56+0000",
			"updated_at" : "2013-09-23T18:26:40+0000",
			"external_accounts" : [],
			"confirmed_at" : "2013-09-23T17:10:56+0000",
			"username" : "3894cbd5e37673a423f4349c3c9530dd",
			"admin" : "false"
		},
		"content_type" : "image/jpeg"
	}],
	"success" : true,
	"error" : false,
	"meta" : {
		"code" : 200,
		"status" : "ok",
		"method_name" : "createPhoto"
	}
};
var photo = {
	"type" : 1,
	"nativePath" : "file:///sdcard/dcim/Camera/UHHPhoto/tia-1476918139.jpg",
	"file" : {
		"hidden" : false,
		"nativePath" : "file:///sdcard/dcim/Camera/UHHPhoto/tia-1476918139.jpg",
		"writable" : true,
		"executable" : false,
		"parent" : {
			"hidden" : false,
			"nativePath" : "file:///sdcard/dcim/Camera/UHHPhoto",
			"writable" : true,
			"executable" : false,
			"parent" : {
				"hidden" : false,
				"nativePath" : "file:///sdcard/dcim/Camera",
				"writable" : true,
				"executable" : false,
				"parent" : {
					"hidden" : false,
					"nativePath" : "file:///sdcard/dcim",
					"writable" : true,
					"executable" : false,
					"parent" : {
						"hidden" : false,
						"nativePath" : "file:///sdcard",
						"writable" : true,
						"executable" : false,
						"parent" : {
							"hidden" : false,
							"nativePath" : "file:///",
							"writable" : false,
							"executable" : false,
							"parent" : null,
							"readonly" : true,
							"directoryListing" : ["dev", "root", "bootcomplete.rc", "cwkeys", "data", "default.prop", "init", "init.goldfish.rc", "init.rc", "init.saga.rc", "proc", "sbin", "sys", "system", "ueventd.goldfish.rc", "ueventd.rc", "ueventd.saga.rc", "devlog", "cache", "etc", "d", "vendor", "mnt", "acct", "sdcard", "config", "app-cache"],
							"size" : 0,
							"name" : "",
							"symbolicLink" : false,
							"bubbleParent" : true
						},
						"readonly" : false,
						"directoryListing" : ["de.appwerft.uhhphoto", "de.appwerft.meetup", "de.appwerft.webmontag", "de.appwerft.l2g", "de.appwerft.uhhap", "de.appwerft.birdsdb", "Fip", "de.appwerft.xenocanto", "DCIM", ".bookmark_thumb1", "download", ".adobe-digital-editions", "tmp", "My Documents", ".data", "de.appwerft.naturlotse", "Android", ".android_secure", "LOST.DIR"],
						"size" : 0,
						"name" : "sdcard",
						"symbolicLink" : false,
						"bubbleParent" : true
					},
					"readonly" : false,
					"directoryListing" : ["Camera", ".thumbnails", "100MEDIA"],
					"size" : 0,
					"name" : "dcim",
					"symbolicLink" : false,
					"bubbleParent" : true
				},
				"readonly" : false,
				"directoryListing" : ["UHHPhoto"],
				"size" : 0,
				"name" : "Camera",
				"symbolicLink" : false,
				"bubbleParent" : true
			},
			"readonly" : false,
			"directoryListing" : ["tia-1476918139.jpg", "tia1229757557.jpg", "tia1456206919.jpg"],
			"size" : 0,
			"name" : "UHHPhoto",
			"symbolicLink" : false,
			"bubbleParent" : true
		},
		"readonly" : false,
		"directoryListing" : [],
		"size" : 832308,
		"name" : "tia-1476918139.jpg",
		"symbolicLink" : false,
		"bubbleParent" : true
	},
	"height" : 2592,
	"width" : 1552,
	"mimeType" : "image/jpeg",
	"length" : 832308,
	"bubbleParent" : true,
	"user_id" : "52400af86f27b60b03051c42",
	"id" : "5240455ea508bb0b0a05db22",
	"created_at" : "2013-09-23T13:42:54+0000",
	"updated_at" : "2013-09-23T13:42:54+0000",
	"user" : {
		"id" : "52400af86f27b60b03051c42",
		"created_at" : "2013-09-23T09:33:44+0000",
		"updated_at" : "2013-09-23T13:57:17+0000",
		"external_accounts" : [],
		"confirmed_at" : "2013-09-23T09:33:44+0000",
		"username" : "25370105fffb2b9c99237cf94c7ebc66",
		"admin" : "false"
	}
};
