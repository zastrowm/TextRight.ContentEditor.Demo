var TextRight;
(function (TextRight) {
    var Utils;
    (function (Utils) {
        var Rect = TextRight.Editor.Internal.Rect;
        /**
         * Math related utility functions
         */
        var MathUtils = (function () {
            function MathUtils() {
            }
            /**
             * Clamp the given value to be between two values
             */
            MathUtils.clamp = function (value, min, max) {
                return Math.max(Math.min(value, max), min);
            };
            return MathUtils;
        })();
        Utils.MathUtils = MathUtils;
        /**
         * String related utility functions
         */
        var StringUtils = (function () {
            function StringUtils() {
            }
            /**
             * Split a series of text on newlines (LF or CRLF or CR)
             */
            StringUtils.splitLines = function (text) {
                return text.split(/\r\n?|\n|\r/);
            };
            return StringUtils;
        })();
        Utils.StringUtils = StringUtils;
        /**
         * Html related utility functions
         */
        var HtmlUtils = (function () {
            function HtmlUtils() {
            }
            /**
             * Create a new element and append it to the given parent element
             * @param parent the element to which the newly created element will
             *        be added
             * @param type the name of the element to create ("DIV" or "P" for example)
             * @param firstClass a class to assign to the newly created element
             */
            HtmlUtils.appendNewElement = function (parent, type, firstClass) {
                if (firstClass === void 0) { firstClass = null; }
                var element = document.createElement(type);
                if (firstClass != null) {
                    element.classList.add(firstClass);
                }
                parent.appendChild(element);
                return element;
            };
            /**
             *  Create a new element and assign it the given class
             * @param type the name of the element to create ("DIV" or "P" for example)
             * @param firstClass a class to assign to the newly created element
             */
            HtmlUtils.createWithClass = function (type, firstClass) {
                var element = document.createElement(type);
                element.classList.add(firstClass);
                return element;
            };
            /**
             * Remove the children of the given element
             */
            HtmlUtils.clearChildren = function (element) {
                while (element.lastChild) {
                    element.removeChild(element.lastChild);
                }
            };
            /**
             * Get the index of the given node in the parent's given child list
             */
            HtmlUtils.findOffsetOf = function (node) {
                var count = 0;
                var curr = node.parentNode.firstChild;
                while (curr !== node) {
                    count++;
                    curr = curr.nextSibling;
                }
                return count;
            };
            /**
             * Get the index of an element within the parent array
             * @return the index of child in parent.children, or -1 if it does
             *         not exist as a child of parent
             */
            HtmlUtils.indexOf = function (parent, child) {
                // return Array.prototype.indexOf.call(parent.children, child);
                var index = 0;
                var element = parent.firstElementChild;
                while (element != null) {
                    if (element === child) {
                        // found it bail out
                        return index;
                    }
                    element = element.nextElementSibling;
                    index++;
                }
                return -1;
            };
            /**
             * Get the contents of the element as a document fragment
             */
            HtmlUtils.convertToFragment = function (element) {
                var range = document.createRange();
                range.selectNodeContents(element);
                var contents = range.extractContents();
                range.detach();
                return contents;
            };
            /**
             * Convert a ClientRect into a Rect, taking into account the windows current
             * scroll position.
             */
            HtmlUtils.fromClientRect = function (rect) {
                return new Rect(rect.top + window.pageYOffset, rect.left + window.pageXOffset, rect.height, rect.width);
            };
            /**
             * Gets the box outline of the given element, in page coordinates
             */
            HtmlUtils.getBoundingClientRectOfElement = function (element) {
                return HtmlUtils.fromClientRect(element.getBoundingClientRect());
            };
            /**
             * Get the position of a single node, in page coordinates
             */
            HtmlUtils.getBoundingClientRectOf = function (node) {
                // elements have a much more optimized method of getting the size:
                if (node instanceof Element) {
                    return this.getBoundingClientRectOfElement(node);
                }
                var range = HtmlUtils.cachedRange;
                range.selectNode(node);
                var rect = range.getBoundingClientRect();
                return HtmlUtils.fromClientRect(rect);
            };
            /**
             * Remove the given element from its parent collection
             */
            HtmlUtils.removeElement = function (element) {
                element.parentElement.removeChild(element);
            };
            /**
             * Set the top/left/height/width of an element
             */
            HtmlUtils.positionElement = function (element, top, left, height, width) {
                element.style.top = (top) + "px";
                element.style.left = (left) + "px";
                element.style.height = (height) + "px";
                element.style.width = (width) + "px";
            };
            HtmlUtils.cachedRange = document.createRange();
            return HtmlUtils;
        })();
        Utils.HtmlUtils = HtmlUtils;
        var DebouncingTimer = (function () {
            function DebouncingTimer(timeout, callback) {
                this.timeout = timeout;
                this.callback = callback;
            }
            DebouncingTimer.prototype.trigger = function () {
                if (this.timerId != null) {
                    clearTimeout(this.timerId);
                    this.timerId = null;
                }
                this.timerId = setTimeout(this.callback, this.timeout);
            };
            return DebouncingTimer;
        })();
        Utils.DebouncingTimer = DebouncingTimer;
    })(Utils = TextRight.Utils || (TextRight.Utils = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=Utils.js.map