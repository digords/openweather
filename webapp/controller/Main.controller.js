sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller,
     * @param {typeof object} formatter
	 */
    function (Controller, formatter) {
        "use strict";

        return Controller.extend("com.demo.openwheater.openwheaterpoc.controller.Main", {

            Formatter: formatter,

            onInit: function () {

            },

            isObject: function (obj) {
                return Object.prototype.toString.call(obj) === '[object Object]';
            },

            getCountry: function (oContext) {
                return oContext.getProperty("country") === "" ? "Global" : oContext.getProperty("country");
            },

            getGroupHeader: function (oGroup) {
                return new sap.m.GroupHeaderListItem({ title: oGroup.key });
            },

            onSearch: function (oEvent) {
                this.getView().byId("citylist").getBinding("items").filter([new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, oEvent.getParameter("query"))]);
            },

            onObjectItemPress: function (oEvent) {
                let _self = this;
                let oView = this.getView();

                let oContext = oEvent.getSource().getBindingContext();

                let oParam = {
                    id: oContext.getProperty("id"),
                    units: "metric",
                    lang: "EN",
                    appid: "31b27c742d2c21b70f92ce5faefc8a16"
                };

                oView.setBusy(true);

                $.get("/data/2.5/weather", oParam)
                    .then(function (response) {
                        let oModel = new sap.ui.model.json.JSONModel(response);
                        $.get("/rest/v2/alpha/" + response.sys.country)
                            .done(function (response) {
                                oModel.getData().sys.country = response.nativeName;
                                oModel.getData().sys.region = response.regionalBlocs.length === 0 ? response.subregion : response.regionalBlocs[0].acronym + " - " + response.regionalBlocs[0].name;
                                oModel.getData().sys.flag = response.flag;
                                oView.byId("objHeader1").setModel(oModel);
                                oView.byId("objHeader1").setVisible(true);
                                _self.getTableContent(oModel);
                                //oView.setBusy(false);
                            })
                            .fail(function (err) {
                                oView.byId("objHeader1").setModel(oModel);
                                oView.setBusy(false);
                            });
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

            getTableContent: function (oModel) {

                let oView = this.getView();

                let oParam = {
                    lat: oModel.getData().coord.lat,
                    lon: oModel.getData().coord.lon,
                    exclude: "minutely",
                    units: "metric",
                    lang: "EN",
                    appid: "31b27c742d2c21b70f92ce5faefc8a16"
                };

                $.get("/data/2.5/onecall", oParam)
                    .done(function (response) {
                        oView.setModel(response, "onecall");
                        oView.byId("itb1").fireSelect({key: "Hour"});
                        oView.setBusy(false);
                    })
                    .fail(function (err) {
                        if (err !== undefined)
                            sap.m.MessageToast.show($.parseJson(err.responseText).message, {
                                duration: 6000
                            });
                        else
                            sap.m.MessageToast.show("Unknown error");
                    });
            },

            onIconSelect: function (oEvent) {

                let oTable = this.getView().byId("tblWheather");
                let oModel;

                switch (oEvent.getParameter("key")) {
                    case "Hour":
                        oModel = this.getView().getModel("onecall").hourly;
                        break;
                    case "Day":
                        oModel = this.getView().getModel("onecall").daily;
                        break;
                    case "Alert":
                        oModel = this.getView().getModel("onecall").alerts;
                        break;
                    default:
                        break;
                }

                this.createTable(oTable, oModel);
            },

            toDateFormat: function (dValue) {
                return new Intl.DateTimeFormat('en-US').format(new Date(dValue));
            },

            createTable: function (oObject, oModel) {

                let aKeys = [];
                let aItems = [];

                aKeys = Object.keys(oModel[0]);

                oObject.destroyColumns();
                oObject.unbindAggregation();
                oObject.setModel(new sap.ui.model.json.JSONModel(oModel));

                for (let i = 0; i < aKeys.length; i++) {

                    let sKey;
                    let oControl;
                    let iPos;

                    switch (aKeys[i]) {
                        case "dt":
                            sKey = "Date";
                            iPos = 6;
                            //oControl = new sap.m.Text().bindText({ path: "dt", formatter: function(sValue){ return new Intl.DateTimeFormat('en-US').format( new Date(sValue * 1000) ); } } );
                            oControl = new sap.m.Text().bindText({ path: "dt", formatter: function (sValue) { return new Date(sValue * 1000).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }); } });
                            break;
                        case "pressure":
                            sKey = "Pressure";
                            iPos = 4;
                            oControl = new sap.m.Text({ text: "{" + aKeys[i] + "}" });
                            break;
                        case "humidity":
                            sKey = "Humidity";
                            iPos = 5;
                            oControl = new sap.m.Text({ text: "{" + aKeys[i] + "}" });
                            break;
                        case "weather":
                            oObject.insertColumn(new sap.m.Column({ header: [new sap.m.Label({ text: "View" })] }), 0);
                            aItems.splice(0, 0, new sap.m.Image({ src: "https://openweathermap.org/img/w/" + "{weather/0/icon}" + ".png" }));

                            sKey = "Weather";
                            iPos = 1;
                            oControl = new sap.m.ObjectIdentifier({ title: "{" + aKeys[i] + "/0/main}", text: "{" + aKeys[i] + "/0/description}" });
                            break;
                        case "visibility":
                            sKey = "Visibility";
                            iPos = 2;
                            oControl = new sap.m.Text({ text: "{" + aKeys[i] + "}" });
                            break;
                        case "wind_speed":
                            sKey = "Wind";
                            iPos = 3;
                            oControl = new sap.m.ObjectIdentifier({ title: "{wind_gust}", text: "{wind_deg}°" });
                            break;
                        case "sunrise":
                            sKey = "Sun Movmt";
                            iPos = 3;
                            oControl = new sap.m.VBox({
                                items: [
                                    new sap.m.Text().bindText({ path: 'sunrise', formatter: function (sValue) { return new Date(sValue * 1000).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }); } }),
                                    new sap.m.Text().bindText({ path: 'sunset', formatter: function (sValue) { return new Date(sValue * 1000).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }); } })
                                ]
                            });
                            break;
                        case "moonrise":
                            sKey = "Moon Movmt";
                            iPos = 3;
                            oControl = new sap.m.VBox({
                                items: [
                                    new sap.m.Text().bindText({ path: 'moonrise', formatter: function (sValue) { return new Date(sValue * 1000).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }); } }),
                                    new sap.m.Text().bindText({ path: 'moonset', formatter: function (sValue) { return new Date(sValue * 1000).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }); } })
                                ]
                            });
                            break;
                        case "temp":
                            sKey = "Temp.";
                            iPos = 3;
                            if (this.isObject(oModel[0].temp))
                                oControl = new sap.m.ObjectStatus({ title: "{temp/max}", text: "{temp/min}", icon: "sap-icon://temperature", state: "Information" });
                            else
                                continue;
                            break;
                        case "sender_name":
                            sKey = "Emitido por";
                            iPos = 1;
                            oControl = new sap.m.Text({ text: "{" + aKeys[i] + "}" });
                            break;
                        case "event":
                            sKey = "Tipo";
                            iPos = 2;
                            oControl = new sap.m.Text({ text: "{" + aKeys[i] + "}" });
                            break;
                        case "start":
                            sKey = "Início";
                            iPos = 3;
                            oControl = new sap.m.Text().bindText({ path: 'start', formatter: function (sValue) { return new Date(sValue * 1000).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }); } });
                            break;
                        case "end":
                            sKey = "Final";
                            iPos = 4;
                            oControl = new sap.m.Text().bindText({ path: 'end', formatter: function (sValue) { return new Date(sValue * 1000).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }); } });
                            break;
                        case "description":
                            sKey = "Descrição";
                            iPos = 5;
                            oControl = new sap.m.Text({ text: "{" + aKeys[i] + "}" });
                            break;
                        default:
                            continue;
                    }

                    oObject.insertColumn(new sap.m.Column({ header: [new sap.m.Label({ text: sKey })] }), iPos);

                    //aItems.push(oControl);
                    aItems.splice(iPos, 0, oControl);

                }

                oObject.bindAggregation("items", { path: "/", template: new sap.m.ColumnListItem({ cells: [aItems] }) });
            }
        });
    });
