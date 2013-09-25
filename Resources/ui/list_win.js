exports.create = function() {
	var self = Ti.UI.createWindow({
		backgroundImage : '/assets/bg.jpg'
	});
	self.scrollview = Ti.UI.createScrollView({
		height : Ti.UI.FILL,
		width : Ti.UI.FILL,
		contentHeight : Ti.UI.SIZE,
		contentWidth : Ti.UI.FILL,
		layout : 'vertical'
	});
	self.progress = Ti.UI.createProgressBar({
		bottom : '10dp',
		width : '90%',
		height : '50dp',
		min : 0,
		max : 0,
		value : 0,
		zIndex : 9999
	});
	self.add(self.scrollview);
	self.add(self.progress);
	Ti.App.PhotoCloud.getAllPhotos(self.progress, function(_data) {
		self.progress.hide();
		if (!_data)
			return;
		var photos = _data.photos;
		if (photos && photos.length > 0) {
			self.scrollview.removeAllChildren();
			for (var i = 0; i < photos.length; i++) {
				var w = Ti.Platform.displayCaps.platformWidth || Ti.UI.FILL;
				var h = Ti.Platform.displayCaps.platformWidth * photos[i]['custom_fields'].height / photos[i]['custom_fields'].width;

				self.scrollview.add(Ti.UI.createImageView({
					top : '1dp',
					width : w,
					height : h,
					image : photos[i].urls['medium_640'],
					border : '1dp',
					borderColor : 'red'
				}));
			}
		} else
			console.log('Error:  no photos');
	});
	return self;
};
