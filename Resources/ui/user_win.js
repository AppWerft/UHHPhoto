exports.create = function() {
	var self = Ti.UI.createWindow({
		backgroundImage : '/assets/bg.jpg'
	});
	self.addEventListener('focus', function() {
		require('ui/uhhlogin').create();
	});
	return self;
};
