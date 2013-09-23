exports.create = function() {
	var self = Ti.UI.createWindow();
	self.tv = Ti.UI.createScrollView({
		height : Ti.UI.FILL,
		layout : 'vertical'
	});
	self.add(self.tv);
	Ti.App.PhotoCloud.getAllPhotos(function(_data) {
		if (_data)
			for (var i = 0; i < _data.length; i++) {
				console.log(_data[i].url);
				self.tv.add(Ti.UI.createImageView({
					top : 0,
					width : Ti.UI.FILL,
					width : 'auto',
					image : _data[i].url
				}));
			}
	});
	return self;
};
