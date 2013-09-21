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
		Ti.App.UHHId.authorize(function(_e) {
			if (_e.success == false) {
				loginbutton.show();
			}
		});
	});
	return self;
};
