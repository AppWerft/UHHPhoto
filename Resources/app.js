(function() {
	console.log('Info: App started =======================');
	Ti.App.GMap = Ti.Android ? require('ti.map') : Ti.Map;
	
	var PhotoCloud = require('model/photocloud');
	Ti.App.PhotoCloud = new PhotoCloud();

	var UHHId = require('model/uhhid');
	Ti.App.UHHId = new UHHId({
		ui : {
			login : require('ui/uhhlogin_dialog')
		}
	});
	require('ui/tabgroup').create();
})();
