sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller) {
        "use strict";

        return Controller.extend("com.demo.openwheater.openwheaterpoc.controller.Details", {
            onInit: function () {
                this.getView().setBusy(true);
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Details").attachPatternMatched(this.onObjectMatched, this);
            },

            onBeforeRendering: function(){
                
            },

            onAfterRendering: function () {
                
            },

            onObjectMatched: function (oEvent) {
                let oView = this.getView();

                let iId = oEvent.getParameter("arguments").id;

                let oParam = {
                    id: iId,
                    units: "metric",
                    lang: "PT",
                    appid: "31b27c742d2c21b70f92ce5faefc8a16"
                }

                oView.setBusy(true);

                $.get("https://api.openweathermap.org/data/2.5/weather", oParam)
                    .done(function (response) {
                        oView.setBusy(false);
                        oView.setModel(new sap.ui.model.json.JSONModel(JSON.stringify(response) ), "detail");
                        oView.updateBindings();
                    })
                    .fail(function (err) {
                        oView.setBusy(false);
                        if (err !== undefined)
                            sap.m.MessageToast.show($.parseJson(err.responseText).message, {
                                duration: 6000
                            });
                        else
                            sap.m.MessageToast.show("Unknown error");
                    });

            },

            onNavBack: function () {
                let oHistory = new sap.ui.core.routing.History.getInstance();
                let sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    let oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteMain", {}, true);
                }
            }
        });
    });