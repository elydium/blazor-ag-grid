using System.Text.Json.Serialization;
using System.Threading.Tasks;
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

        public class DefaultColumnState
        {
            // True if the column is hidden 
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public bool? Hide { get; set; }

            // Width of the column in pixels 
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public double? Width { get; set; }

            // Column's flex if flex is set
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public double? Flex { get; set; }

            // Sort applied to the column 
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public string Sort { get; set; } // 'asc' or 'desc' or null;

            // The order of the sort, if sorting by many columns 
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public int? SortIndex { get; set; }

            // The aggregation function applied 
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public string AggFunc { get; set; }

            // True if pivot active 
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] 
            public bool? Pivot { get; set; }

            // The order of the pivot, if pivoting by many columns 
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public int? PivotIndex { get; set; }

            // Set if column is pinned
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public bool? Pinned { get; set; }

            // True if row group active 
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public bool? RowGroup { get; set; }

            // The order of the row group, if grouping by many columns 
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public int? RowGroupIndex { get; set; }
        }

        public class ColumnState : DefaultColumnState
        {
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public string ColId { get; set; }
        }

        public class ColumnStateParameters
        {
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public ColumnState[] State { get; set; }

            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public bool? ApplyOrder { get; set; }

            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public DefaultColumnState DefaultState { get; set; }
        }
    }
}
