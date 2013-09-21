exports.create = function() {
	var self = Ti.UI.createProgressBar({
		bottom : '10dp',
		height : '50dp',
		min : 0,
		max : 1,
		width : '90%',
		value : 0,
		visible : false
	});
	return self;
};
