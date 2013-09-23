exports.create = function() {
	var self = Ti.UI.createWindow({
		backgroundImage : '/assets/bg.jpg'
	});
	self.loginbutton = Ti.UI.createButton({
		bottom : '10dp',
		title : 'Anmeldung'
	});
	self.camerabutton = Ti.UI.createButton({
		bottom : '10dp',
		right : '10dp',
		color : 'white',
		width : '60dp',
		height : '60dp',
		backgroundImage : '/assets/camera.png',
		backgroundSelectedImage : '/assets/camera_.png',
	});
	self.camerabutton.add(Ti.UI.createImageView({
		image : '/assets/camera.png',
		width : 90,
		height : 40,
		right : 10
	}));
	self.tv = Ti.UI.createTableView({
		height : Ti.UI.FILL,
		backgroundColor : 'white'
	});

	var uhh_user = Ti.App.UHHId.isAuth();
	if (uhh_user != null) {
		Ti.App.PhotoCloud.createUser(uhh_user);
		self.add(self.tv);
		self.add(self.camerabutton);
	} else {
		self.add(self.loginbutton);
	}

	/* Events */

	self.tv.addEventListener('click', function(_e) {
		if (_e.rowData.ndx == 0) {
			Ti.Media.showCamera({
				allowEditing : false,
				autohide : true,
				mediaTypes : Ti.Media.MEDIA_TYPE_PHOTO,
				showControls : true,
				success : function(_e) {
					if (_e.success) {
						console.log(_e.media);
						Ti.App.PhotoCloud.postItem({
							post : _e.media
						});
					}
				}
			});
		}
	});
	self.camerabutton.addEventListener('click', function(_e) {
		Ti.Media.showCamera({
			allowEditing : false,
			autohide : true,
			mediaTypes : Ti.Media.MEDIA_TYPE_PHOTO,
			showControls : true,
			success : function(_e) {
				if (_e.success) {
					console.log(_e.media);
					Ti.App.PhotoCloud.postItem({
						post : {
							photo : _e.media,
							title : 'no title',
							geoposition : {
								latitude : 53.35,
								longitude : 10
							}
						}
					});
				}
			}
		});

	});
	self.loginbutton.addEventListener('click', function() {
		self.loginbutton.hide();
		Ti.App.UHHId.authorize(function(_e) {
			if (_e.success == false) {
				self.loginbutton.show();
			} else {
				self.add(self.tv);
				console.log('Info: list of own photos added');

			}
		});
	});
	return self;
};

