var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            /**
             * Encapsulates where a cursor should appear for a given DocumentCursor.
             */
            var PointPosition = (function () {
                /**
                 * Constructor.
                 * @param {number} top where the top of the cursor would be located.
                 * @param {number} left where left of the cursor would be located.
                 * @param {number} height the hight of the cursor.
                 */
                function PointPosition(top, left, height) {
                    this.top = top;
                    this.left = left;
                    this.height = height;
                }
                /**
                 * Create a position which looks at the right side of the given client rectangle.
                 */
                PointPosition.rightOf = function (rect) {
                    return new PointPosition(rect.top, rect.right, rect.height);
                };
                /**
                * Create a position which looks at the left side of the given client rectangle.
                */
                PointPosition.leftOf = function (rect) {
                    return new PointPosition(rect.top, rect.left, rect.height);
                };
                /**
                 * Check if one point is considered in the same line as another element.  A point is
                 * considered on the same line if the height of one position continues onto the same
                 * line as the top of the other position.
                 */
                PointPosition.prototype.isInlineWith = function (position) {
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
                PointPosition.prototype.distanceTo = function (left) {
                    return Math.abs(left - this.left);
                };
                return PointPosition;
            })();
            Internal.PointPosition = PointPosition;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=PointPosition.js.map