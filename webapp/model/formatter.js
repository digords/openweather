sap.ui.define([], function () {
    "use strict";

    return {

        toDateFormat: function (sValue) {
            return sValue !== undefined ? new Date(sValue * 1000).toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}) : "";
        },

        toTempState: function(sValue) {
            return sValue < 23 ? "Information" : "Contrast";
        }

    };
}, true);