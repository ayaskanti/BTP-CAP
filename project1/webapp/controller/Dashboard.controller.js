sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("project1.controller.Dashboard", {
            onInit: function () {
                
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("dashboard").attachMatched(this._onRouteMatched, this);
                
    
                this._objectPageLayout = this.getView().byId("ObjectPageLayout");
                // this.userSettingsData();
            },
            _onRouteMatched: function (oEvent) {
              
            },
            onPressTile: function (oEvent) {
                // var that = this;
                var route = oEvent.getSource().getCustomData().find(e => e.getProperty("key") == "route").getValue();
                var key = oEvent.getSource().getCustomData().find(e => e.getProperty("key") == "key").getValue();
                
                // Ensure the context of 'this' is preserved
                var getRouter = sap.ui.core.UIComponent.getRouterFor(this);
                getRouter.navTo(route);
                if (key) {
                   this.sideNavigation(key);
                }
             },
            dynamicObjectPageSection: function () {
                let layout = this._objectPageLayout
                let section = new sap.uxap.ObjectPageSection();
                let subSection = new sap.uxap.ObjectPageSubSection();
                let container = new sap.f.GridContainer();
            },
            sideNavigation: function (key) {
                var oData = {
                    "navigation": [
                        {
                            "title": "Home",
                            "icon": "sap-icon://bbyd-dashboard",
                            "expanded": false,
                            "key": "dashboard"
                        },
                        {
                            "title": "Administration",
                            "key": 1,
                            "items": [
                                {
                                    "title": "Company",
                                    "key": "Comp-table",
                                    "icon": "sap-icon://company-view",
                                    "enabled": true
                                },
                                // {
                                //     "title": "Communication Arrangements",
                                //     "key": "manage-communication-arrangements",
                                //     "icon": "sap-icon://SAP-icons-TNT/technicalscenario",
                                //     "enabled": true
                                // },
                               
                            ]
                        }
                    ],
                    "fixedNavigation": [
                        {
                            "title": "Validations",
                            "icon": "sap-icon://settings",
                            "expanded": false,
                            "key": "validation"
                        }
                    ]
                     
                }

                let filteredNav = oData.navigation.find(e => e.key == key);
                oData.title = filteredNav?.title;
                oData.navigation = filteredNav?.items;
                oData.selectedSectionKey = key;
                let oModel = this.getOwnerComponent().getModel("sideNavigation");
                let merge = { ...oModel?.getData(), ...oData };
                // this.getOwnerComponent().setModel(new JSONModel(merge), "sideNavigation");
                oModel.refresh();
            }
        });
    });
