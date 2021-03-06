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
	self.progress = Ti.UI.createProgressBar({
		bottom : '10px',
		width : Ti.UI.FILL,
		height : '50dp',
		left : '10dp',
		min : 0,
		value : 0,
		max : 1,
		visible : false,
		right : '100dp'

	});
	self.preview = Ti.UI.createImageView({
		width : '60%',
		borderRadius : 10,
		height : 'auto',
		opacity : 0,
		zIndex : 9999
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

	Ti.App.UHHId.isAuth(function(_success) {
		if (_success == true) {
			self.add(self.tv);
			self.add(self.camerabutton);
			self.add(self.progress);
		} else {
			self.add(self.loginbutton);
		}
	});
	/* Events */

	self.camerabutton.addEventListener('click', function(_e) {
		Ti.Media.showCamera({
			allowEditing : false,
			autohide : true,
			mediaTypes : Ti.Media.MEDIA_TYPE_PHOTO,
			showControls : true,
			success : function(_e) {
				if (_e.success) {
					self.preview.image = _e.media.nativePath;
					console.log('-------');
					console.log(_e.width);
					console.log(_e.height);
					console.log('-------');
					Ti.App.PhotoCloud.postPhoto({
						progress : self.progress,
						preview : self.preview,
						post : {
							photo : _e.media,
							title : 'no title',
							coordinates : [10,53.55],
							width : _e.width,
							height : _e.height

						}
					});
				}
			}
		});

	});
	self.loginbutton.addEventListener('click', function() {
		self.loginbutton.hide();
		Ti.App.UHHId.authorize(function(_success) {
			if (_success == false) {
				self.loginbutton.show();
			} else {
				self.add(self.tv);
				self.add(self.camerabutton);
				console.log('Info: list of own photos added');

			}
		});
	});
	self.add(self.preview);
	return self;
};

