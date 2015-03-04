var TextRight;
(function (TextRight) {
    var Internal;
    (function (Internal) {
        /**
         * Convenience methods for creating instances of IEventHandler
         */
        var EventHandlers = (function () {
            function EventHandlers() {
            }
            /**
             * Creates a a handler for the specific event target and specified event name.
             * @param instance the object to create the event handler for.
             * @param eventName the name of the event that the event handler will enable or disable.
             * @param handler the method that will be invoked when the event is triggered.
             * @param shouldBeEnabledByDefault (optional) true if the event handler should be enabled
             *                                 before returning
             * @return An IEventHandler that is not yet enabled.
             */
            EventHandlers.from = function (instance, eventName, handler, shouldBeEnabledByDefault) {
                if (shouldBeEnabledByDefault === void 0) { shouldBeEnabledByDefault = false; }
                var eventHandler = new EventHandler(instance, eventName, handler);
                if (shouldBeEnabledByDefault) {
                    eventHandler.enable();
                }
                return eventHandler;
            };
            /**
             * Creates a a handler for the specific event targets and specified event name.
             * @param instances the objects to create the event handler for.  If the returned event
             *                  handler is enabled and any of the objects trigger the event, the
             *                  event handler will be invoked.
             * @param eventName the name of the event that the event handler will enable or disable.
             * @param handler the method that will be invoked when any of the instances trigger the
             *                given event.
             * @param shouldBeEnabledByDefault (optional) true if the event handler should be enabled
             *                                 before returning
             * @return An IEventHandler that is not yet enabled.
             */
            EventHandlers.fromMany = function (instances, eventName, handler, shouldBeEnabledByDefault) {
                if (shouldBeEnabledByDefault === void 0) { shouldBeEnabledByDefault = false; }
                var eventHandler = new MultiInstanceEventHandler(instances, eventName, handler);
                if (shouldBeEnabledByDefault) {
                    eventHandler.enable();
                }
                return eventHandler;
            };
            return EventHandlers;
        })();
        Internal.EventHandlers = EventHandlers;
        /**
         * An event handler for a single target and event
         */
        var EventHandler = (function () {
            function EventHandler(instance, eventName, handler) {
                this.instance = instance;
                this.eventName = eventName;
                this.handler = handler;
            }
            EventHandler.prototype.enable = function () {
                this.instance.addEventListener(this.eventName, this.handler);
            };
            EventHandler.prototype.disable = function () {
                this.instance.removeEventListener(this.eventName, this.handler);
            };
            return EventHandler;
        })();
        /**
         * An event handler for a single target and event
         */
        var MultiInstanceEventHandler = (function () {
            function MultiInstanceEventHandler(instances, eventName, handler) {
                this.instances = instances;
                this.eventName = eventName;
                this.handler = handler;
            }
            MultiInstanceEventHandler.prototype.enable = function () {
                var _this = this;
                this.instances.forEach(function (instance) {
                    instance.addEventListener(_this.eventName, _this.handler);
                });
            };
            MultiInstanceEventHandler.prototype.disable = function () {
                var _this = this;
                this.instances.forEach(function (instance) {
                    instance.removeEventListener(_this.eventName, _this.handler);
                });
            };
            return MultiInstanceEventHandler;
        })();
    })(Internal = TextRight.Internal || (TextRight.Internal = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=EventHandlers.js.map