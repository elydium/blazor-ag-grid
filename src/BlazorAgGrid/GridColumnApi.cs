﻿using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace AgGrid.Blazor
{
    /// <summary>
    /// Strongly-typed access to:
    ///   https://www.ag-grid.com/javascript-grid-column-api/
    /// </summary>
    public class GridColumnApi
    {
        internal string CallColumnApi = "BlazorAgGrid.gridOptions_callColumnApi";

        private IJSRuntime _js;
        private string _id;

        internal GridColumnApi(IJSRuntime js, string id)
        {
            _js = js;
            _id = id;
        }

        public Task SizeColumnsToFit(int width)
        {
            return CallApi("sizeColumnsToFit", width);
        }

        public Task AutoSizeColumn(string colKey)
        {
            return CallApi("autoSizeColumn", colKey);
        }

        public  Task AutoSizeColumns(string[] colKeys)
        {
            // Cast to make sure arg is not unwound
            return CallApi("autoSizeColumns", (object)colKeys);
        }

        public Task ApplyColumnState(ColumnStateParameters colStateParams)
        {
            return CallApi("applyColumnState", colStateParams);
        }

        private Task CallApi(string name, params object[] args)
        {
            return _js.InvokeVoidAsync(CallColumnApi, _id, name, args).AsTask();
        }

        public class ColumnState
        {
            public string ColId { get; set; }
            public bool Hide { get; set; }
        }

        public class ColumnStateParameters
        { 
            public ColumnState[] State { get; set; }
            public bool ApplyOrder { get; set; } = false;
            public ColumnState? DefaultState { get; set; }
        }
    }
}
