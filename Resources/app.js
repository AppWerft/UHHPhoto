(function() {
	Ti.App.GMap = Ti.Android ? require('ti.map') : Ti.Map;
	require('ui/tabgroup').create();
})();
