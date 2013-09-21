exports.create = function() {
	var container = Ti.UI.createView({
		layout : 'vertical',
		width : Ti.UI.FILL
	});
	var logo = Ti.UI.createView({
		backgroundColor : '#fff',
		height : '50dp',
		top : 0
	});
	logo.add(Ti.UI.createImageView({
		image : '/assets/rrz.png',
		left : 0,
		width : 'auto',
		height : '50dp'
	}));
	logo.add(Ti.UI.createImageView({
		image : '/assets/stine.png',
		right : 0,
		height : '50dp',
		width : 'auto'
	}));
	container.add(logo);
	var login = Ti.UI.createTextField({
		width : Ti.UI.FILL,
		hintText : 'STiNE- oder F-Kennung'
	});
	var password = Ti.UI.createTextField({
		width : Ti.UI.FILL,
		hintText : 'Passwort',
		passwordMask : true
	});
	container.add(login);
	container.add(password);
	var self = Ti.UI.createAlertDialog({
		buttonNames : ['UHH-Login'],
		androidView : container
	});

	self.show();
};