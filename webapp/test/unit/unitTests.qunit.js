/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comdemo.openwheater./openwheater_poc/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
