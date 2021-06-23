﻿using Microsoft.JSInterop;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AgGrid.Blazor
{
    public partial class GridEvents
    {
        private Dictionary<string, object> _handlers = new Dictionary<string, object>();

        public IReadOnlyDictionary<string, object> Handlers => _handlers;

        private void Set(Action action,
            [CallerMemberName] string name = null)
        {
            _handlers[name] = new EventAction(action);
        }

        private void Set<TInput>(Action<TInput> action,
            [CallerMemberName]string name = null)
        {
            _handlers[name] = new EventAction<TInput>(action);
        }

        private void Set<TInput, TResult>(Func<TInput, TResult> func,
                [CallerMemberName]string name = null)
        {
            _handlers[name] = new EventFunc<TInput, TResult>(func);
        }

        internal class EventAction
        {
            private Action _action;

            public EventAction(Action action)
            {
                JsRef = DotNetObjectReference.Create(this);
                _action = action;
            }

            public DotNetObjectReference<EventAction> JsRef { get; }

            [JSInvokable]
            public void Invoke() => _action();
        }

        internal class EventAction<TInput>
        {
            private Action<TInput> _action;

            public EventAction(Action<TInput> action)
            {
                JsRef = DotNetObjectReference.Create(this);
                _action = action;
            }

            public DotNetObjectReference<EventAction<TInput>> JsRef { get; }

            [JSInvokable]
            public void Invoke(TInput input) => _action(input);
        }

        internal class EventFunc<TInput, TResult>
        {
            private Func<TInput, TResult> _func;

            public EventFunc(Func<TInput, TResult> func)
            {
                JsRef = DotNetObjectReference.Create(this);
                _func = func;
            }

            public DotNetObjectReference<EventFunc<TInput, TResult>> JsRef { get; }

            [JSInvokable]
            public TResult Invoke(TInput input) => _func(input);
        }
    }
}
