exports.create = function() {
	var self = Ti.UI.createWindow({
		backgroundImage : '/assets/bg.jpg'
	});
	var loginbutton = Ti.UI.createButton({
		bottom : '10dp',
		title : 'Anmeldung'
	});
	self.add(loginbutton);
	loginbutton.addEventListener('click', function() {
		loginbutton.hide();
		Ti.App.UHHId.authorize(self, function(e) {
		});
	});
	return self;
};
