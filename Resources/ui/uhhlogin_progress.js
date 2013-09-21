exports.create = function() {
	var self = Ti.UI.createProgressBar({
		bottom : '10dp',
		height : '50dp',
		min : 0,
		max : 1,
		value : 0
	});
	return self;
};
