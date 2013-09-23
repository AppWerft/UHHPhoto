var Dialog = function() {
	var androidView = Ti.UI.createView({
		layout : 'vertical',
		height : Ti.UI.SIZE,
		width : Ti.UI.FILL,
		backgroundColor : 'red'
	});
	androidView.logo = Ti.UI.createView({
		backgroundColor : '#fff',
		height : '50dp',
		top : 0
	});
	androidView.logo.add(Ti.UI.createImageView({
		image : '/assets/rrz.png',
		left : 0,
		width : 'auto',
		height : '50dp'
	}));
	androidView.logo.add(Ti.UI.createImageView({
		image : '/assets/stine.png',
		right : 0,
		height : '50dp',
		width : 'auto'
	}));
	androidView.login = Ti.UI.createTextField({
		width : Ti.UI.FILL,
		top : '15dp',
		left : '20dp',
		right : '20dp',
		value: 'f6sv005',
		height : '50dp',
		hintText : 'STiNE- oder F-Kennung'
	});
	androidView.password = Ti.UI.createTextField({
		width : Ti.UI.FILL,
		top : '5dp',
		left : '20dp',
		right : '20dp',
		height : '50dp',
		bottom : '15dp',
		value : '*MHpsNH',
		hintText : 'Passwort dazu',
		passwordMask : true
	});
	androidView.add(androidView.logo);
	androidView.add(Ti.UI.createLabel({
		top : '5dp',
		borderRadius : '5dp',
		left : '20dp',
		right : '20dp',
		height : '50dp',
		bottom : 0,
		color : 'white',
		font : {
			fontSize : '11dp'
		},
		text : 'Du kast Dich hier mit der STiNE-Kennung oder mit der sogenannten F-Kennung ausweisen. Letztere ist identisch mit der  WLAN-, eMail und Netstorage-Kennung.'
	}));
	androidView.add(androidView.login);
	androidView.add(androidView.password);
	var self = Ti.UI.createAlertDialog({
		buttonNames : ['Anmelden!'],
		//title : 'UHH-Login',
		androidView : androidView
	});
	self.addEventListener('click', function() {
		self.fireEvent('login', {
			user : androidView.login.getValue() + ':' + androidView.password.getValue()
		});
	});
	return self;
};
module.exports = Dialog;
