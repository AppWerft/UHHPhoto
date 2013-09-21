exports.create = function() {
	var self = Ti.UI.createWindow();
	const START = 0.1;
	var region = {
		latitude : 53.5627630,
		longitude : 9.9880207,
		latitudeDelta : START,
		longitudeDelta : START
	};
	self.gmap = Ti.App.GMap.createView({
		userLocation : false,
		enableZoomControls : false,
		mapType : Ti.App.GMap.NORMAL_TYPE,
		userLocationButton : true,
		region : region
	});
	self.add(self.gmap);
	return self;
};
