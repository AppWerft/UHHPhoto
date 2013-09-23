exports.get = function(_callback) {
	Ti.Geolocation.purpose = 'Get Current Location';
	if (Ti.Platform.osname == 'android') {
		var gpsProvider = Ti.Geolocation.Android.createLocationProvider({
			name : Ti.Geolocation.PROVIDER_GPS,
			minUpdateTime : 600,
			minUpdateDistance : 100
		});
		var gpsRule = Ti.Geolocation.Android.createLocationRule({
			provider : Ti.Geolocation.PROVIDER_GPS,
			accuracy : 10,
			maxAge : 300,
			minAge : 10
		});
		Ti.Geolocation.Android.addLocationRule(gpsRule);
		Ti.Geolocation.Android.addLocationProvider(gpsProvider);
	}
	Ti.Geolocation.getCurrentPosition(function(_e) {
		var latlng = _e.latitude + ',' + _e.longitude;
		console.log(latlng);
		var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&sensor=false';
		var self = Ti.Network.createHTTPClient({
			onload : function() {
				var _res = JSON.parse(this.responseText);
				if (_res.status == 'OK') {
					var comps = _res.results[0].address_components;
					var res = {};
					for (var i = 0; i < comps.length; i++) {
						if (comps[i].types[0] == 'country')
							res.country = comps[i]["long_name"];
						if (comps[i].types[0] == 'locality')
							res.city = comps[i]["long_name"];
						if (comps[i].types[0] == 'route')
							res.street = comps[i]["long_name"];
						if (comps[i].types[0] == 'street_number')
							res.number = comps[i]["long_name"];
					}
					if (!res.number)
						res.number = '';
					if (!res.street)
						res.street = '';
					_callback(res);
				}
				_callback(null);
			},
			onerror : function() {
				_callback(null);
			}
		});
		self.open('GET', url, true);
		self.send();
	});
};
