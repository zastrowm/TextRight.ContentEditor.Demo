var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            /**
             * A top/left/height/width container
             */
            var Rect = (function () {
                /**
                 * Constructor.
                 * @param {number} top where the top of the cursor would be located.
                 * @param {number} left where left of the cursor would be located.
                 * @param {number} height the hight of the cursor.
                 */
                function Rect(top, left, height, width) {
                    this.top = top;
                    this.left = left;
                    this.height = height;
                    this.width = width;
                }
                Object.defineProperty(Rect.prototype, "bottom", {
                    /**
                    * The height added to the top
                    */
                    get: function () {
                        return this.top + this.height;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Rect.prototype, "right", {
                    /**
                     * The width added to the left
                     */
                    get: function () {
                        return this.left + this.width;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Check if one point is considered in the same line as another element.  A point is
                 * considered on the same line if the height of one position continues onto the same
                 * line as the top of the other position.
                 */
                Rect.prototype.isInlineWith = function (position) {
                    var first;
                    var second;
                    // get the higher point
                    if (this.top <= position.top) {
                        first = this;
                        second = position;
                    }
                    else {
                        first = position;
                        second = this;
                    }
                    // if the second point has its top between the top of the first
                    // point and the first points bottom, the second point is considered
                    // inline with the other
                    // WASBUG: there should be an overlap of at least 1 or 2 pixels, thus the 2 offset
                    return second.top < (first.top + first.height - 2);
                };
                /**
                 * Get the distance to a left offset.
                 */
                Rect.prototype.distanceTo = function (left) {
                    return Math.abs(left - this.left);
                };
                return Rect;
            })();
            Internal.Rect = Rect;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=Rect.js.map