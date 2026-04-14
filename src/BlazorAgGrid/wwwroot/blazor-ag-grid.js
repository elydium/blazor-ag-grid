window.BlazorAgGrid = {
    callbackMap: {}
    , renderCount: 0
    , gridApi: null
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

        // register custom renderers and editors, so that we can reference them by name
        op.components = {
            stringCheckboxCellEditor: StringCheckboxCellEditor,
            stringCheckboxCellRenderer: StringCheckboxCellRenderer,
            stringCheckboxCellCombinedRendererEditor: StringCheckboxCellCombinedRendererEditor
            //selectRenderer: InteractiveSelectRenderer
        }

        // create the grid passing in the div to use together with the columns & data we want to use
        //console.log("have options(BEF): " + BlazorAgGrid.util_stringify(op));
        //new agGrid.Grid(gridDiv, op);
        gridApi = agGrid.createGrid(gridDiv, op);
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
                    rowPinned: data.rowPinned,
                    context: data.context,
                    event: data.event,
                    value: data.value,
                    oldValue: data.oldValue,
                    newValue: data.newValue
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
        if (gridEvents.handlers.CellEditingStarted) {
            console.log("Wrapping CellEditingStarted handler");
            gridOptions.onCellEditingStarted = function (event) {
                var ev = {
                    data: event.data,
                    rowNodeId: event.node.id,
                    rowIndex: event.rowIndex,
                    rowPinned: event.rowPinned,
                    context: event.context,
                    event: event.event,
                    field: event.colDef.field,
                    columnId: event.column.colId,
                    value: event.value
                };
                var id = gridEvents.handlers.CellEditingStarted.jsRef.invokeMethodAsync("Invoke", ev);
            }
        }
        if (gridEvents.handlers.CellEditingStopped) {
            console.log("Wrapping CellEditingStopped handler");
            gridOptions.onCellEditingStopped = function (event) {
                var ev = {
                    data: event.data,
                    rowNodeId: event.node.id,
                    rowIndex: event.rowIndex,
                    rowPinned: event.rowPinned,
                    context: event.context,
                    event: event.event,
                    field: event.colDef.field,
                    columnId: event.column.colId,
                    value: event.value,
                    oldValue: event.oldValue,
                    newValue: event.newValuet
                };
                var id = gridEvents.handlers.CellEditingStopped.jsRef.invokeMethodAsync("Invoke", ev);
            }
        }
        if (gridEvents.handlers.RowEditingStarted) {
            console.log("Wrapping RowEditingStarted handler");
            gridOptions.onRowEditingStarted = function (event) {
                var ev = {
                    data: event.data,
                    rowNodeId: event.node.id,
                    rowIndex: event.rowIndex,
                    rowPinned: event.rowPinned,
                    context: event.context,
                    event: event.event
                };
                var id = gridEvents.handlers.RowEditingStarted.jsRef.invokeMethodAsync("Invoke", ev);
            }
        }
        if (gridEvents.handlers.RowEditingStopped) {
            console.log("Wrapping RowEditingStopped handler");
            gridOptions.onRowEditingStopped = function (event) {
                var ev = {
                    data: event.data,
                    rowNodeId: event.node.id,
                    rowIndex: event.rowIndex,
                    rowPinned: event.rowPinned,
                    context: event.context,
                    event: event.event
                };
                var id = gridEvents.handlers.RowEditingStopped.jsRef.invokeMethodAsync("Invoke", ev);
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
        // some functions require additional pre-processing
        if (name === "setColumnDefs") {
            // for each kvp in rowCellRenderers and rowCellEditors, set the
            // component and parameters using a custom cellRendererSelector/cellEditorSelector function
            args[0].forEach(colDef => {
                if (typeof colDef.context.rowCellRenderers !== 'undefined' && colDef.context.rowCellRenderers !== null) {
                    colDef.cellRendererSelector = params => {
                        var rowCellRenderer = params.colDef.context.rowCellRenderers[params.node.rowIndex];

                        if (rowCellRenderer === undefined || rowCellRenderer === null)
                            return {
                                component: null // this defaults to a basic string renderer
                            };
                        else
                            return {
                                component: rowCellRenderer.cellRenderer,
                                params: rowCellRenderer.cellRendererParameters
                            };
                    }
                }

                if (typeof colDef.context.rowCellEditors !== 'undefined' && colDef.context.rowCellEditors !== null) {
                    colDef.cellEditorSelector = params => {
                        var rowCellEditor = params.colDef.context.rowCellEditors[params.rowIndex];

                        if (rowCellEditor === undefined || rowCellEditor === null)
                            return {
                                component: null // this prevents editing
                            };
                        else
                            return {
                                component: rowCellEditor.cellEditor,
                                params: rowCellEditor.cellEditorParameters
                            };
                    }
                }

                // set individual cells as being non-editable if their row indexes are in nonEditableRowIndexes
                if (typeof colDef.context.nonEditableRowIndexes !== 'undefined' && colDef.context.nonEditableRowIndexes !== null) {
                    colDef.editable = (params) => !colDef.context.nonEditableRowIndexes.includes(params.node.rowIndex);

                    colDef.cellClassRules = {
                        'cell-read-only': (params) => colDef.context.nonEditableRowIndexes.includes(params.node.rowIndex)
                    };
                }
            });

            // following update to ag-grid v32, we need to update the grid options directly
            gridApi.setGridOption("columnDefs", args[0]);
            return;
        }
        else if (name === "setRowData") {
            // following update to ag-grid v32, we need to update the grid options directly
            gridApi.setGridOption("rowData", args[0]);
            return;
        }

        var fn = gridApi[name];
        var result = fn.apply(gridApi, args || []);

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
        gridApi.getRowNode(rowNodeId).setDataValue(columnId, value);
    }
    , gridOptions_getCellValue: function (callbackId, rowNodeId, columnId) {
        var rowNode = gridApi.getRowNode(rowNodeId);
        return gridApi.getValue(columnId, rowNode);
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
        var selectedNodes = gridApi.getSelectedNodes();
        //var json = BlazorAgGrid.util_stringify(selectedNodes);
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
            newN["parent"] = window.BlazorAgGrid.util_mapRowNode(n.parent);
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

class StringCheckboxCellRenderer {
    init(params) {
        this.eGui = document.createElement("span");

        if (params.value !== "True" && params.value !== "False") {
            this.eGui.textContent = "";
            return;
        }

        const input = document.createElement("input");
        input.type = "checkbox";
        //input.disabled = true; // rely on the colum def's isEditable
        input.checked = params.value === "True";

        this.eGui.appendChild(input);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        this.init(params);
        return true;
    }
}

class StringCheckboxCellEditor {
    init(params) {
        this.params = params;
        this.eInput = document.createElement("input");
        this.eInput.type = "checkbox";
        this.eInput.checked = params.value === "True";

        this.checkedHandler = this.checkedHandler.bind(this);
        this.eInput.addEventListener('click', this.checkedHandler);
    }

    // trigger a refresh
    checkedHandler(e) {
        let checked = e.target.checked;
        let colId = this.params.column.colId;
        this.params.node.setDataValue(colId, checked ? 'True' : 'False');
    }

    getGui() {
        return this.eInput;
    }

    afterGuiAttached() {
        this.eInput.focus();
    }

    getValue() {
        return this.eInput.checked ? "True" : "False";
    }

    isPopup() {
        return false;
    }

    destroy(params) {
        this.eInput.removeEventListener('click', this.checkedHandler);
    }
}

// Combined renderer and editor (avoids the user having to double-click to enter edit mode)
// see https://blog.ag-grid.com/binding-boolean-values-to-checkboxes-in-ag-grid/
class StringCheckboxCellCombinedRendererEditor {

    init(params) {
        this.params = params;

        var startRow = params?.colDef?.cellRendererParams ?? 0;
        if (!params.node.rowIndex || params.node.rowIndex < startRow) {
            this.eGui = document.createElement('div')
            this.eGui.innerHTML = params.value || '';
            return;
        }

        this.eGui = document.createElement('input');
        this.eGui.type = 'checkbox';
        this.eGui.checked = params.value === 'True';

        if (params.isReadOnly) {
            this.eGui.disabled = true;
        }

        this.checkedHandler = this.checkedHandler.bind(this);
        this.eGui.addEventListener('click', this.checkedHandler);
    }

    checkedHandler(e) {
        let checked = e.target.checked;
        let colId = this.params.column.colId;
        this.params.node.setDataValue(colId, checked ? 'True' : 'False');
    }

    getGui(params) {
        return this.eGui;
    }

    destroy(params) {
        this.eGui.removeEventListener('click', this.checkedHandler);
    }
}

//class InteractiveSelectRenderer {
//    init(params) {
//        this.params = params;
//        this.eGui = document.createElement('div');
//        this.eGui.className = 'ag-cell-select-wrapper';

//        // Create select element
//        this.select = document.createElement('select');
//        this.select.className = 'ag-cell-select';

//        // Get options from params
//        const options = params.options || [];

//        // Add options to select
//        options.forEach(option => {
//            const optElement = document.createElement('option');

//            // Handle both object and primitive options
//            if (typeof option === 'object') {
//                optElement.value = option.value;
//                optElement.text = option.label;
//            } else {
//                optElement.value = option;
//                optElement.text = option;
//            }

//            this.select.appendChild(optElement);
//        });

//        // Set current value - by label
//        this.select.value = params.value === '[Arr]' ? 'arr'
//            : params.value === '[Dep]' ? 'dep'
//            : '';

//        // Handle change events
//        this.select.addEventListener('change', this.onChange.bind(this));

//        this.eGui.appendChild(this.select);
//    }

//    getGui() {
//        return this.eGui;
//    }

//    onChange(event) {
//        const newValue = event.target.value;

//        // If you have a valueFormatter, use it
//        const displayValue = this.params.column.getColDef().valueFormatter ?
//            this.params.column.getColDef().valueFormatter({
//                value: newValue,
//                data: this.params.data
//            }) :
//            newValue;

//        // Update the cell
//        if (this.params.onValueChange) {
//            this.params.onValueChange(newValue);
//        }

//        // Optional: Trigger grid refresh
//        this.params.api.refreshCells({
//            rowNodes: [this.params.node],
//            columns: [this.params.column.getId()]
//        });
//    }

//    // Optional: Cleanup
//    destroy() {
//        // Remove event listeners if needed
//        this.select.removeEventListener('change', this.onChange);
//    }
//}
