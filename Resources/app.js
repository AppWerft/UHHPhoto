(function() {
	Ti.App.GMap = Ti.Android ? require('ti.map') : Ti.Map;
	var UHHId = require('model/uhhid');
	Ti.App.UHHId = new UHHId({
		ui : {
			login : require('ui/uhhlogin_dialog').create(),
			progress : require('ui/uhhlogin_progress').create()
		}
	});
	require('ui/tabgroup').create();
})();
