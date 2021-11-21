window.BlazorAgGrid = {
    callbackMap: {}
    , renderCount: 0
    , createGrid: function (gridDiv, interopOptions, configScript) {
        //console.log("GOT GridOptions: " + BlazorAgGrid.util_stringify(interopOptions));
        var id = interopOptions.CallbackId;
        var op = interopOptions.Options;
        var cb = interopOptions.Callbacks;
        var ev = interopOptions.Events;
        var ds = op.datasource;
        //console.log("JS-creating grid for [" + id + "]...");

        // Remember for subsequent API calls
        BlazorAgGrid.callbackMap[id] = interopOptions;

        if (cb) {
            BlazorAgGrid.createGrid_wrapCallbacks(op, cb);
        }

        if (ev) {
            BlazorAgGrid.createGrid_wrapEvents(op, ev);
        }

        if (ds) {
            console.log("DS Ref: " + JSON.stringify(ds));
            BlazorAgGrid.createGrid_wrapDatasource(op, ds);
        }

        if (configScript) {
            if (window[configScript]) {
                window[configScript].call(null, op);
            }
            else {
                console.error("gridOptions local configScript was specified but could not be resolved; ABORTING");
                return;
            }
        }

        // register vanilla JS checkbox renderer
        op.components = {
            checkboxRenderer: CheckboxRenderer
        }

        // create the grid passing in the div to use together with the columns & data we want to use
        //console.log("have options(BEF): " + BlazorAgGrid.util_stringify(op));
        new agGrid.Grid(gridDiv, op);
        //console.log("have options(AFT): " + BlazorAgGrid.util_stringify(op));
    }
    , destroyGrid: function (gridDiv, id) {
        console.log("JS-destroying grid [" + id + "]...");

        // TODO: What else should we do to properly clean up resources???

        delete BlazorAgGrid.callbackMap[id];
    }
    , createGrid_wrapDatasource: function (op, ds) {
        var nativeDS = BlazorAgGrid.util_wrapDatasource(ds);
        op.datasource = nativeDS;
    }
    , createGrid_wrapCallbacks: function (gridOptions, gridCallbacks) {
        console.log("Got GridCallbacks: " + JSON.stringify(gridCallbacks));
        if (gridCallbacks.handlers.GetRowNodeId) {
            //console.log("Wrapping GetRowNodeId handler");
            gridOptions.getRowNodeId = function (data) {
                //console.log("gridOptions.getRowNodeId <<< " + JSON.stringify(data));
                var id = gridCallbacks.handlers.GetRowNodeId.jsRef.invokeMethod("Invoke", data);
                //console.log("gridOptions.getRowNodeId >>> [" + id + "]");
                return id;
            }
        }
        if (gridCallbacks.handlers.GetDataPath) {
            //console.log("Wrapping GetDataPath handler");
            gridOptions.getDataPath = function (data) {
                //console.log("gridOptions.getDataPath <<< " + JSON.stringify(data));
                var path = gridCallbacks.handlers.GetDataPath.jsRef.invokeMethod("Invoke", data);
                //console.log("gridOptions.getDataPath >>> [" + path + "]");
                return path;
            }
        }
        if (gridCallbacks.handlers.IsExternalFilterPresent) {
            //console.log("Wrapping IsExternalFilterPresent handler");
            gridOptions.isExternalFilterPresent = function () {
                //console.log("gridOptions.isExternalFilterPresent");
                var result = gridCallbacks.handlers.IsExternalFilterPresent.jsRef.invokeMethod("Invoke");
                //console.log("gridOptions.isExternalFilterPresent >>> [" + result + "]");
                return result;
            }
        }
        if (gridCallbacks.handlers.DoesExternalFilterPass) {
            //console.log("Wrapping DoesExternalFilterPass handler");
            gridOptions.doesExternalFilterPass = function (data) {
                var node = BlazorAgGrid.util_mapRowNode(data); // ensure there are no circular references
                //console.log("gridOptions.doesExternalFilterPass <<< " + JSON.stringify(node));
                var result = gridCallbacks.handlers.DoesExternalFilterPass.jsRef.invokeMethod("Invoke", node);
                //console.log("gridOptions.doesExternalFilterPass >>> [" + result + "]");
                return result;
            }
        }
        if (gridCallbacks.handlers.GetRowClass) {
            //console.log("Wrapping GetRowClass handler");
            gridOptions.getRowClass = function (data) {
                var node = BlazorAgGrid.util_mapRowNode(data.node); // ensure there are no circular references
                //console.log("gridOptions.getRowClass <<< " + JSON.stringify(node));
                var classes = "";
                setTimeout(function () { gridCallbacks.handlers.GetRowClass.jsRef.invokeMethod("Invoke", node); }, 0) // avoid problems when calling during row rendering by wrapping call with setTimeout()
                //console.log("gridOptions.getRowClass >>> [" + classes + "]");
                return classes;
            }
        }
    }
    ,
    // see https://www.ag-grid.com/javascript-grid/grid-events/
    createGrid_wrapEvents: function (gridOptions, gridEvents) {
        console.log("Got GridEvents: " + JSON.stringify(gridEvents));
        if (gridEvents.handlers.SelectionChanged) {
            console.log("Wrapping SelectionChanged handler");
            gridOptions.onSelectionChanged = function () {
                BlazorAgGrid.gridOptions_onSelectionChanged(gridOptions, gridEvents);
            }
        }
        if (gridEvents.handlers.CellValueChanged) {
            console.log("Wrapping CellValueChanged handler");
            gridOptions.onCellValueChanged = function (data) {
                var ev = {
                    data: data.data,
                    rowNodeId: data.node.id,
                    field: data.colDef.field,
                    columnId: data.column.colId,
                    rowIndex: data.rowIndex,
                    oldValue: data.oldValue,
                    newValue: data.value
                };
                var id = gridEvents.handlers.CellValueChanged.jsRef.invokeMethodAsync("Invoke", ev);
            }
        }
        if (gridEvents.handlers.RowValueChanged) {
            console.log("Wrapping RowValueChanged handler");
            gridOptions.onRowValueChanged = function (event) {
                var ev = {
                    data: event.data,
                    rowNodeId: event.node.id,
                    rowIndex: event.rowIndex,
                    rowPinned: event.rowPinned,
                    context: event.context,
                    event: event.event
                };
                var id = gridEvents.handlers.RowValueChanged.jsRef.invokeMethodAsync("Invoke", ev);
            }
        }
        if (gridEvents.handlers.CellClicked) {
            console.log("Wrapping CellClicked handler");
            gridOptions.onCellClicked = function (event) {
                var ev = {
                    data: event.data,
                    rowNodeId: event.node.id,
                    rowIndex: event.rowIndex,
                    rowPinned: event.rowPinned,
                    context: event.context,
                    event: event.event,
                    //column: event.column,
                    //colDef: event.colDef,
                    columnId: event.column.colId,
                    field: event.colDef.field,
                    value: event.value
                };
                var id = gridEvents.handlers.CellClicked.jsRef.invokeMethodAsync("Invoke", ev);
            }
        }
        if (gridEvents.handlers.FirstDataRendered) {
            console.log("Wrapping FirstDataRendered handler");
            gridOptions.onFirstDataRendered = function () {
                var id = gridEvents.handlers.FirstDataRendered.jsRef.invokeMethodAsync("Invoke");
            }
        }
        if (gridEvents.handlers.GridReady) {
            console.log("Wrapping GridReady handler");
            gridOptions.onGridReady = function () {
                var id = gridEvents.handlers.GridReady.jsRef.invokeMethodAsync("Invoke");
            }
        }
        if (gridEvents.handlers.CellContextMenu) {
            console.log("Wrapping CellContextMenu handler");
            gridOptions.onCellContextMenu = function (event) {
                var mouseEvent = {
                    clientX: event.event.clientX,
                    clientY: event.event.clientY,
                    pageX: event.event.pageX,
                    pageY: event.event.pageY
                };

                var ev = {
                    data: event.data,
                    rowNodeId: event.node.id,
                    rowIndex: event.rowIndex,
                    rowPinned: event.rowPinned,
                    context: event.context,
                    event: mouseEvent,
                    //column: event.column,
                    //colDef: event.colDef,
                    columnId: event.column.colId,
                    field: event.colDef.field,
                    value: event.value
                };
                var id = gridEvents.handlers.CellContextMenu.jsRef.invokeMethodAsync("Invoke", ev);
            }
        }
    }
    , gridOptions_callGridApi: function (callbackId, name, args) {
        //console.log("getting gridOptions for [" + callbackId + "]");
        var gridOptions = BlazorAgGrid.callbackMap[callbackId];
        //console.log("got gridOptions: " + gridOptions);
        var op = gridOptions.Options;
        var api = op.api;
        var fn = api[name];

        if (name === "setColumnDefs") {
            // for each kvp in rowCellEditors, set the 
            // cellEditor and cellEditorParams for the appropriate row
            // using a custom cellEditorSelector function
            args[0].forEach(colDef => {
                if (colDef.rowCellEditors !== null) {
                    colDef.cellEditorSelector = params => {
                        var rowCellEditor = params.colDef.rowCellEditors[params.rowIndex];

                        if (rowCellEditor === undefined || parseInt(params.column.colId) >= rowCellEditor.StartColumn)
                            return undefined;
                        else
                            return {
                                component: rowCellEditor.cellEditor,
                                params: rowCellEditor.cellEditorParameters
                            };
                    }
                }
            });
        }

        //console.log("has Grid API [" + name + "]: " + fn);
        var result = fn.apply(api, args || []);
        switch (name) {
            case "getSelectedRows":
                return result.map(this.util_mapRowNode);
            case "getRowNode":
                return this.util_mapRowNode(result);
            case "applyTransaction":
                return {
                    add: result.add.map(this.util_mapRowNode),
                    remove: result.remove.map(this.util_mapRowNode),
                    update: result.update.map(this.util_mapRowNode)
                }
            default:
                return result;
        }
    }
    , gridOptions_callColumnApi: function (callbackId, name, args) {
        //console.log("getting gridOptions for [" + callbackId + "]");
        var gridOptions = BlazorAgGrid.callbackMap[callbackId];
        //console.log("got gridOptions: " + gridOptions);
        var op = gridOptions.Options;
        var api = op.columnApi;
        var fn = api[name];
        //console.log("has Column API [" + name + "]: " + fn);
        fn.apply(api, args || []);
    }
    , gridOptions_setDatasource: function (callbackId, ds) {
        //console.log("getting gridOptions for [" + callbackId + "]");
        var gridOptions = BlazorAgGrid.callbackMap[callbackId];
        //console.log("got gridOptions: " + gridOptions);
        var op = gridOptions.Options;
        var api = op.api;

        if (!ds) {
            // Simply reset with existing DS
            console.log("Resetting DS with existing DS");
            api.setDatasource(op.datasource);
        }
        else {
            console.log("Setting DS with NEW DS");
            var nativeDS = BlazorAgGrid.util_wrapDatasource(ds);
            api.setDatasource(nativeDS);
        }
    }
    , gridOptions_setCellValue: function (callbackId, rowNodeId, columnId, value) {
        //console.log("getting gridOptions for [" + callbackId + "]");
        var gridOptions = BlazorAgGrid.callbackMap[callbackId];
        //console.log("got gridOptions: " + gridOptions);
        var op = gridOptions.Options;
        var api = op.api;

        api.getRowNode(rowNodeId).setDataValue(columnId, value);
    }
    , gridOptions_getCellValue: function (callbackId, rowNodeId, columnId) {
        //console.log("getting gridOptions for [" + callbackId + "]");
        var gridOptions = BlazorAgGrid.callbackMap[callbackId];
        //console.log("got gridOptions: " + gridOptions);
        var op = gridOptions.Options;
        var api = op.api;

        var rowNode = api.getRowNode(rowNodeId);
        return api.getValue(columnId, rowNode);
    }
    // cell range selection is only available in AG-Grid Enterprise
    , gridOptions_setSelectedCell: function (callbackId, rowIndex, columnId) {
        var gridOptions = BlazorAgGrid.callbackMap[callbackId];
        var op = gridOptions.Options;
        var api = op.api;

        api.clearRangeSelection();
        api.addCellRange({
            rowStartIndex: rowIndex,
            rowEndIndex: rowIndex,
            columnStart: columnId,
            columnEnd: columnId
        });
    }
    , gridOptions_onSelectionChanged: function (gridOptions, gridEvents) {
        console.log("js-onSelectionChanged");
        var selectedNodes = gridOptions.api.getSelectedNodes();
        var json = BlazorAgGrid.util_stringify(selectedNodes);
        var mapped = selectedNodes.map(this.util_mapRowNode);
        console.log("js-selectedNodes: " + JSON.stringify(mapped));
        gridEvents.handlers.SelectionChanged.jsRef.invokeMethodAsync('Invoke', mapped);
    }
    , datasource_successCallback: function (callbackId, rowsThisBlock, lastRow) {
        var getRowsParams = BlazorAgGrid.callbackMap[callbackId];
        console.log("datasource_successCallback: " + callbackId);
        getRowsParams.successCallback(rowsThisBlock, lastRow);
        console.log("unmapping callback: " + callbackId);
        delete BlazorAgGrid.callbackMap[callbackId];
    }
    , datasource_failCallback: function (callbackId, rowsThisBlock, lastRow) {
        var getRowsParams = BlazorAgGrid.callbackMap[callbackId];
        console.log("datasource_failCallback: " + callbackId);
        getRowsParams.failCallback();
        console.log("unmapping callback: " + callbackId);
        delete BlazorAgGrid.callbackMap[callbackId];
    }
    , util_wrapDatasource: function (ds) {
        // Need to "wrap" the data source
        console.log("Wrapping datasource");
        var nativeDS = {
            getRows: function (getRowsParams) {
                //console.log("getting rows for: " + JSON.stringify(getRowsParams));
                var callbackId = BlazorAgGrid.util_genId();
                BlazorAgGrid.callbackMap[callbackId] = getRowsParams;
                getRowsParams.callbackId = callbackId;
                //console.log("mapped callback ID for ds: " + callbackId + "; " + JSON.stringify(dsRef));
                ds.invokeMethodAsync('GetRows', getRowsParams);
            },
            destroy: function () {
                //console.log("destroying  datasource...");
                ds.invokeMethodAsync('Destroy');
            }
        };
        return nativeDS;
    }
    // Cycle-safe version of JSON.stringify, useful for debugging
    , util_stringify: function (obj) {
        // Note: cache should not be re-used by repeated calls to JSON.stringify.
        var cache = [];
        var json = JSON.stringify(obj, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Duplicate reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        cache = null; // Enable garbage collection
        return json;
    }
    // Maps raw Row Node objects to something safer for passing back to .NET
    , util_mapRowNode: function (n) {
        let newN = {};

        // Standard properties as defined here:
        //    https://www.ag-grid.com/javascript-grid-row-node/#row-object-aka-row-node
        newN["id"] = n.id;
        newN["data"] = n.data;
        if (n.parent) {
            newN["parent"] = BlazorAgGrid.util_mapRowNode(n.parent);
        }
        newN["level"] = n.level;
        newN["uiLevel"] = n.uiLevel;
        newN["group"] = n.group;
        newN["rowPinned"] = n.rowPinned;
        newN["canFlower"] = n.canFlower;
        newN["childFlower"] = n.childFlower;
        newN["childIndex"] = n.childIndex;
        newN["firstChild"] = n.firstChild;
        newN["lastChild"] = n.lastChild;
        newN["stub"] = n.stub;
        newN["rowHeight"] = n.rowHeight;
        newN["rowTop"] = n.rowTop;
        newN["quickFilterAggregateText"] = n.quickFilterAggregateText;

        // Additional properties found through observation
        newN["selectable"] = n.selectable;
        newN["alreadyRendered"] = n.alreadyRendered;
        newN["selected"] = n.selected;
        newN["master"] = n.master;
        newN["expanded"] = n.expanded;
        newN["allChildrenCount"] = n.allChildrenCount;
        newN["rowHeightEstimated"] = n.rowHeightEstimated;
        newN["rowIndex"] = n.rowIndex;

        return newN;
    }
    , util_genId: function () {
        return Math.random().toString(36).substr(2);
    }
};

// see https://blog.ag-grid.com/binding-boolean-values-to-checkboxes-in-ag-grid/
function CheckboxRenderer() { }

CheckboxRenderer.prototype.init = function (params) {
    this.params = params;

    this.eGui = document.createElement('input');
    this.eGui.type = 'checkbox';
    this.eGui.checked = params.value === 'True';

    this.checkedHandler = this.checkedHandler.bind(this);
    this.eGui.addEventListener('click', this.checkedHandler);
}

CheckboxRenderer.prototype.checkedHandler = function (e) {
    let checked = e.target.checked;
    let colId = this.params.column.colId;
    this.params.node.setDataValue(colId, checked ? 'True' : 'False');
}

CheckboxRenderer.prototype.getGui = function (params) {
    return this.eGui;
}

CheckboxRenderer.prototype.destroy = function (params) {
    this.eGui.removeEventListener('click', this.checkedHandler);
}
