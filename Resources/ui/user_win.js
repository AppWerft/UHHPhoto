exports.create = function() {
	var self = Ti.UI.createWindow({
		backgroundImage : '/assets/bg.jpg'
	});
	self.addEventListener('focus', function() {
		Ti.App.UHHId.authorize(self, function(e) {
		});
	});
	return self;
};
