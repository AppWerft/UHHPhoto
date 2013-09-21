// this sets the background color of the master UIView (when there are no windows/tab groups on it)
exports.create = function() {
	Ti.UI.backgroundColor = 'white';
	var tabGroup = Titanium.UI.createTabGroup({
		backgroundColor : 'white'
	});
	var tab1 = Titanium.UI.createTab({
		icon : '/icons/list.png',
		title : 'Bilder-Liste',
		window : require('ui/list_win').create()
	});
	var tab2 = Titanium.UI.createTab({
		icon : '/icons/map.png',
		title : 'Bilder-Karte',
		window : require('ui/map_win').create()
	});
	var tab3 = Titanium.UI.createTab({
		icon : '/icons/user.png',
		title : 'Meine Bilder',
		window : require('ui/user_win').create()
	});
	tabGroup.addTab(tab1);
	tabGroup.addTab(tab2);
	tabGroup.addTab(tab3);
	tabGroup.open();
};
require('ui/uhhlogin').create();
