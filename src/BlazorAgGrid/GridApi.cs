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
        /// Set new datasource for Infinite Row Model.
        /// </summary>
        /// <param name="datasource">New datasource</param>
        public Task SetDatasource(IGridDatasource datasource = null)
        {
            return _js.InvokeVoidAsync("BlazorAgGrid.gridOptions_setDatasource", _id, datasource).AsTask();
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
    }
}
