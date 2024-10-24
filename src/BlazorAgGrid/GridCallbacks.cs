﻿using System;
using System.Text.Json;

namespace AgGrid.Blazor
{
    /// <summary>
    /// Strongly-typed counterpart of:
    ///    https://www.ag-grid.com/javascript-grid-callbacks/
    /// </summary>
    public partial class GridCallbacks
    {
        public Func<JsonElement, string> GetRowNodeId { set => Set(value); }

        public Func<JsonElement, string[]> GetDataPath { set => Set(value); }

        public Func<bool> IsExternalFilterPresent { set => Set(value); }

        public Func<RowNode, bool> DoesExternalFilterPass { set => Set(value); }

        public Func<RowNode, string[]> GetRowClass { set => Set(value); }
    }
}
