sap.ui.define([
    "project1/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "project1/utils/URLConstants",
    "sap/ui/core/Core",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    'sap/ui/export/Spreadsheet',
    'sap/m/Token'

], function (BaseController, JSONModel, MessageToast, URLConstants, Core, MessageBox, Fragment,Spreadsheet, Token) {
    "use strict";
    var that = this;
    return BaseController.extend("project1.controller.company.Company", {

        onInit: function () {
            this.oOwnerComponent = this.getOwnerComponent();
            this.oRouter = this.oOwnerComponent.getRouter();
            this.oModel = this.oOwnerComponent.getModel();

            this.oRouter.getRoute("Comp-table").attachMatched(this._onRouteMatched, this);

            this.getView().setModel(new JSONModel(), "advancedFilterMdl");
            this.btn_request_type = this.getView().setModel(new JSONModel(), "advancedFilterMdl");
            this._tableId = this.byId("tableId_companies");
            this._pageId = this.byId("page_MngCompanies");

            this._mViewSettingsDialogs = {};
            
            // var oModel = new JSONModel(oData);
            // this.getView().setModel(oModel, "companyMdl");
        },
        _onRouteMatched: function (oEvent) {
            this.fetchcomp();

            let oSettingsModel = this.oOwnerComponent.getModel("settings");
            oSettingsModel.getData().columns = this.createColumnConfig();
            oSettingsModel.refresh(true);

        },
 // onPressHome: function () {
        //     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        //     oRouter.navTo("dashboard")
        // },

        fetchcomp: async function () {
            try {
                var that = this;
                this.showLoading(true);
                let path = URLConstants.URL.comp_all;
                let obj = await this.restMethodGet(path);
                this.getView().setModel(new JSONModel(obj), "companyMdl");
                this.showLoading(false);
            }
            catch (ex) {
                that.showLoading(false);
                // this.errorHandling(ex);
            }
        },
        createColumnConfig: function () {
            return [
                {
                    label: 'Company Id',
                    property: 'compID',
                    width: "25"
                },
                {
                    label: 'Company Name',
                    property: 'compName',
                    width: "25"
                },
                {
                    label: 'Company Department',
                    property: 'compdept',
                    width: "25"
                }
            ];
        },
        advancedFilter: function () {
            let filters = [];
            let mdl = this.getView().getModel("advancedFilterMdl");
            let data = mdl.getData();

            for (let [key, value] of Object.entries(data)) {
                if (value != "") {

                    if (key == "compName") {
                        filters.push(new sap.ui.model.Filter(key, sap.ui.model.FilterOperator.Contains, value));
                    } else {
                        filters.push(new sap.ui.model.Filter(key, sap.ui.model.FilterOperator.EQ, value));
                    }

                }
            }
            let binding = this._tableId.getBinding("items");
            binding.filter(filters);
        },
        clearAllFilters: function () {
            this.getView().setModel(new JSONModel(), "advancedFilterMdl");
            this.advancedFilter();
        },
        // handleExport: function () { // Export handler
        //     let dataSource = this.getView().getModel("companyMdl").getData();
        //     this.onExport(this.createColumnConfig(), dataSource, "Company");
        // }
        onPressExport: function () {
            let thet = this;
            let aCols, aComp, oSettings;
            let oModel = this.getView().getModel("companyMdl")
            aComp = oModel.getData();
            if (oModel && aComp.length > 0) {
                let array = aComp.map(ele => {
                    return {
                        ["Company Id"]: ele.compID,
                        ["Company Name"]: ele.compName,
                        ["Company Department"]: ele.compdept,
                    }

                });
                let worksheet = XLSX.utils.json_to_sheet(array);

                const workbook = XLSX.utils.book_new();

                XLSX.utils.book_append_sheet(workbook, worksheet, 'Company');

                XLSX.writeFile(workbook, 'Company.xlsx');

            } else {
                sap.m.MessageBox.information("Table data are not available! Please select a different Period Code or Import.")
            }
        },

        onPressImport: function (oEvent) {
            let that = this;
            let excelData = [];
            let file = oEvent.getParameter("files")[0];
            if (file && window.FileReader) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    let data = e.target.result;
                    let workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    let book_name;
                    workbook.SheetNames.forEach(function (sheetName, index) {
                        book_name = sheetName;
                        var obj = {
                            [book_name]: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
                        }
                        excelData.push(obj);
                    })
                    let filExcelData = excelData.find(e => Object.keys(e).find(e1 => e1 == "Company"));

                    let array = filExcelData['Company'].map(ele => {
                        return {
                            compID: ele["Company Id"],
                            compName: ele ["Company Name"],
                            compdept: ele ["Company Department"],
                        }
                    });

                    that.getView().setModel(new JSONModel(array), "companyMdl");
                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsBinaryString(file);
            }
        },
    });
});