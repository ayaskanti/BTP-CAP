sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/ui/model/Filter",
    "sap/m/Button",
    "project1/utils/URLConstants",
    "sap/ui/core/routing/History",
    "sap/ui/core/Element",
    "sap/ui/core/Fragment",
    "sap/m/library",
    "sap/ui/export/Spreadsheet",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/m/MessageBox'
], function (Controller,JSONModel,Dialog,Filter,Button, URLConstants,History,Element,Fragment,library,Spreadsheet,Sorter,Device,MessageBox) {
    "use strict";
    return Controller.extend(
        "project1.controller.BaseController",
        {
          onInit: function () {
            //console.log("test")
          },
          getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
          },
          /**
           * Convenience method for getting the view model by name.
           * @public
           * @param {string} [sName] the model name
           * @returns {sap.ui.model.Model} the model instance
           */
          getModel: function (sName) {
            return this.getView().getModel(sName);
          },
  
          /**
           * Convenience method for setting the view model.
           * @public
           * @param {sap.ui.model.Model} oModel the model instance
           * @param {string} sName the model name
           * @returns {sap.ui.mvc.View} the view instance
           */
          setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
          },
  
          /**
           * Getter for the resource bundle.
           * @public
           * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
           */
          getResourceBundle: function (text) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(text);
          },

          showLoading: function (status) {
            this.getView().setBusy(status);
          },
          onDialogOpen: function () {
            this._oDialog.open();
            this._startCounter();
          },
          onDialogClose: function () {
            this._oDialog.close();
            this._stopCounter();
          },
          
          getViewSettingsDialog: function (sDialogFragmentName) {
            var that = this;
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
            if (!pDialog) {
              pDialog = sap.ui.xmlfragment(sDialogFragmentName, that);
              pDialog.setModel(
                new JSONModel(
                  this.getOwnerComponent().getModel("settings").getData()
                ),
                "settings"
              );
              this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
          },
          handleSortButtonPressed: function () {
            this.getViewSettingsDialog(
              "com.project1.view.fragment.SortDialog"
            ).open();
          },
  
          handleGroupButtonPressed: function () {
            this.getViewSettingsDialog(
              "com.project1.view.fragment.GroupDialog"
            ).open();
          },
          handlePersoButtonPressed: function () {
            //this.getViewSettingsDialog("com.payroll.payrollapp.view.fragment.TablePersoDialog").open();
            this._persoDialog;
            this._persoDialogTable;
            if (!this._persoDialog) {
              this._persoDialog = sap.ui.xmlfragment(
                "com.project1.fragment.TablePersoDialog",
                this
              );
              this._persoDialog.setModel(
                new JSONModel(
                  this.getOwnerComponent().getModel("settings").getData()
                ),
                "settings"
              );
              this._persoDialogTable = this._persoDialog
                .getCustomTabs()[0]
                .getContent()[0];
            }
            this._persoDialog.open();
          },
          handleGroupDialogConfirm: function (oEvent) {
            var oTable = this._tableId,
              mParams = oEvent.getParameters(),
              oBinding = oTable.getBinding("items"),
              sPath,
              bDescending,
              vGroup,
              aGroups = [];
  
            let gContext = function (oContext) {
              return oContext.getProperty(sPath);
            };
  
            if (mParams.groupItem) {
              sPath = mParams.groupItem.getKey();
              bDescending = mParams.groupDescending;
              //vGroup = this.mGroupFunctions[sPath];
              aGroups.push(new Sorter(sPath, bDescending, gContext));
              // apply the selected group settings
              oBinding.sort(aGroups);
            } else if (this.groupReset) {
              oBinding.sort();
              this.groupReset = false;
            }
          },
          resetGroupDialog: function (oEvent) {
            this.groupReset = true;
          },
          handleTablePersoDialogConfirm: function (oEvent) {
            //Handle Table Perso Confirm functionality
            let oTable = this._tableId,
              pTable = this._persoDialogTable;
  
            this.selItems = pTable.getSelectedItems();
            if (this.selItems && !this.persoReset) {
              let colNames = this.selItems.map((e) =>
                e.getCells()[0].getProperty("text")
              );
              this._tableId.getColumns().forEach((e) => {
                let colName = colNames.some(
                  (e1) => e1 == e.getHeader().getText()
                );
                if (colName) {
                  e.setVisible(true);
                } else {
                  e.setVisible(false);
                }
              });
            } else if (this.persoReset) {
              this._tableId.getColumns().forEach((e) => e.setVisible(true));
              this.persoReset = false;
            }
          },
          resetPersoDialog: function (oEvent) {
            this.persoReset = true;
            this._persoDialogTable.removeSelections();
          },
          onExport: function (columns, dataSource, fileName) {
            //**Export table functionality enabled here**
            let aCols, oSettings, oSheet, oContext;
  
            aCols = columns;
            oContext = {
              sheetName: fileName
            };
  
            oSettings = {
              workbook: {
                columns: aCols,
                context: oContext
              },
              dataSource: dataSource,
              fileName: fileName,
            };
  
            oSheet = new Spreadsheet(oSettings);
            oSheet
              .build()
              .then(function () {
                sap.m.MessageToast.show("Spreadsheet export has finished");
              })
              .finally(function () {
                oSheet.destroy();
              });
          },
         
          setColulmnsIntoModel: function () {
            let oSettingsModel = this.oOwnerComponent.getModel("settings");
            oSettingsModel.getData().columns = this.createColumnConfig();
            oSettingsModel.refresh(true);
          },
          ///************API Calls***********///
          restMethodGet: function (url) {
            let that = this;
            url = 'http://localhost:8080/compTable';
            var deferred = $.Deferred();
           
              $.ajax({
                type: "GET",
                beforeSend: function (xhr) {
                  xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                },
                url: url,
                contentType: "application/json",
                //headers: { "my-token": token },
                success: function (response) {
                  deferred.resolve(response);
                },
                error: function (xhr) {
                  deferred.reject(xhr); //.responseJSON.message);
                  if (xhr && xhr.status == "401") {
                   
                  }
                },
              });
           
            return deferred.promise();
          },
         
        }
      );
});