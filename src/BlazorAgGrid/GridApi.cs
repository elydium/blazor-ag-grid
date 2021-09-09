using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace AgGrid.Blazor
{
    /// <summary>
    /// Strongly-typed access to:
    ///   https://www.ag-grid.com/javascript-grid-api/
    /// </summary>
    public class GridApi
    {
        internal string CallGridApi = "BlazorAgGrid.gridOptions_callGridApi";

        private IJSRuntime _js;
        private string _id;

        internal GridApi(IJSRuntime js, string id)
        {
            _js = js;
            _id = id;
        }

        public Task SizeColumnsToFit()
        {
            return CallApi("sizeColumnsToFit");
        }

        public Task RefreshCells(RefreshCellsParams @params = null)
        {
            if (@params == null)
                return CallApi("refreshCells");
            else
                return CallApi("refreshCells", @params);
        }

        public Task RedrawRows(RedrawRowsParams @params = null)
        {
            if (@params == null)
                return CallApi("redrawRows");
            else
                return CallApi("redrawRows", @params);
        }

        public Task RefreshInfiniteCache()
        {
            return CallApi("refreshInfiniteCache");
        }

        public Task PurgeInfiniteCache()
        {
            return CallApi("purgeInfiniteCache");
        }

        public Task OnFilterChanged()
        {
            return CallApi("onFilterChanged");
        }

        // https://www.ag-grid.com/javascript-grid/grid-api/

        /// <summary>
        /// Set rows
        /// </summary>
        /// <param name="rows">Data of rows</param>
        public Task SetRowData(IEnumerable<object> rows)
        {
            return CallApi("setRowData", rows);
        }

        /// <summary>
        /// Set column definitions
        /// </summary>
        /// <param name="columnDefs">Column definitions</param>
        public Task SetColumnDefs(IEnumerable<ColumnDefinition> columnDefs)
        {
            return CallApi("setColumnDefs", columnDefs);
        }

        /// <summary>
        /// Get row data as CSV
        /// </summary>
        /// <returns></returns>
        public Task<string> GetDataAsCsv(GetDataAsCsvParams @params = null)
        {
            if (@params == null)
                return CallApi<string>("getDataAsCsv");
            else
                return CallApi<string>("getDataAsCsv", @params);
        }

        public Task UndoCellEditing()
        {
            return CallApi("undoCellEditing");
        }

        public Task RedoCellEditing()
        {
            return CallApi("redoCellEditing");
        }

        public Task<int> GetCurrentUndoSize()
        {
            return CallApi<int>("getCurrentUndoSize");
        }

        public Task<int> GetCurrentRedoSize()
        {
            return CallApi<int>("getCurrentRedoSize");
        }

        public Task<RowNodeTransaction> ApplyTransaction(RowDataTransaction transaction)
        {
            return CallApi<RowNodeTransaction>("applyTransaction", transaction);
        }

        public Task<RowNode[]> GetSelectedRows()
        {
            return CallApi<RowNode[]>("getSelectedRows");
        }

        public Task<RowNode> GetRowNode(string rowNodeId)
        {
            return CallApi<RowNode>("getRowNode", rowNodeId);
        }

        /// <summary>
        /// Set new datasource for Infinite Row Model.
        /// </summary>
        /// <param name="datasource">New datasource</param>
        public Task SetDatasource(IGridDatasource datasource = null)
        {
            return _js.InvokeVoidAsync("BlazorAgGrid.gridOptions_setDatasource", _id, datasource).AsTask();
        }

        /// <summary>
        /// Update the value of an individual cell
        /// </summary>
        /// <param name="rowNodeId">The row node index</param>
        /// <param name="columnId">The text column id</param>
        /// <param name="value"></param>
        /// <returns></returns>
        public Task SetCellValue(string rowNodeId, string columnId, object value)
        {
            return _js.InvokeVoidAsync("BlazorAgGrid.gridOptions_setCellValue", _id, rowNodeId, columnId, value).AsTask();
        }

        /// <summary>
        /// Retrieve the value of an individual cell
        /// </summary>
        /// <param name="rowNodeId">The row node index</param>
        /// <param name="columnId">The text column id</param>
        /// <returns></returns>
        public Task<object> GetCellValue(string rowNodeId, string columnId)
        {
            return _js.InvokeAsync<object>("BlazorAgGrid.gridOptions_getCellValue", _id, rowNodeId, columnId).AsTask();
        }

        /// <summary>
        /// Select an individual cell
        /// N.B. Cell range selection is only available in AG-Grid Enterprise
        /// </summary>
        /// <param name="rowIndex">The numeric row index</param>
        /// <param name="columnId">The text column id</param>
        /// <returns></returns>
        public Task<object> SetSelectedCell(int rowIndex, string columnId)
        {
            return _js.InvokeAsync<object>("BlazorAgGrid.gridOptions_setSelectedCell", _id, rowIndex, columnId).AsTask();
        }

        private Task CallApi(string name, params object[] args)
        {
            return _js.InvokeVoidAsync(CallGridApi, _id, name, args).AsTask();
        }

        private Task<T> CallApi<T>(string name, params object[] args)
        {
            return _js.InvokeAsync<T>(CallGridApi, _id, name, args).AsTask();
        }

        public class RefreshCellsParams
        {
            /// specify rows, or all rows by default
            public RowNode[] RowNodes { get; set; }
            /// specify columns, or all columns by default
            public string[] Columns { get; set; }
            /// skips change detection, refresh everything
            public bool Force { get; set; }
        }

        public class RedrawRowsParams
        {
            /// the row nodes to redraw
            public RowNode[] RowNodes { get; set; }
        }

        public class GetDataAsCsvParams
        {
            public char ColumnSeparator { get; set; } = ',';
            public bool SuppressQuotes { get; set; } = false;
            public bool SkipColumnHeaders { get; set; } = false;
            public bool AllColumns { get; set; } = false;
        }

        /// <summary>
        /// The parameters for applying a transaction
        /// </summary>
        public class RowDataTransaction
        {
            // rows to add
            public object[] Add { get; set; }

            // index to add rows
            public int? AddIndex { get; set; }

            // rows to remove
            public object[] Remove { get; set; }

            // rows to update
            public object[] Update { get; set; }
        }

        /// <summary>
        /// The result of applying a transaction
        /// </summary>
        public class RowNodeTransaction
        {
            public RowNode[] Add { get; set; }
            public RowNode[] Remove { get; set; }
            public RowNode[] Update { get; set; }
        }
    }
}
