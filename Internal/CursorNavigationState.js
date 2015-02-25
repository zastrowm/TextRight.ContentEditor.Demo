var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            /**
             * State describing how the cursor should move when navigating up or down.  This encapsulates the
             * state when navigating up/down after using Home/End keys.
             */
            var CursorNavigationState = (function () {
                /**
                 * Default constructor, do not use
                 */
                function CursorNavigationState() {
                    this.x = 0;
                }
                /**
                 * Create a state which represents moving towards the given coordinate. Used when
                 * hitting the up/down key after typing and we should attempt to maintain the "line"
                 * when moving between virtual lines.
                 */
                CursorNavigationState.fromPosition = function (x) {
                    var state = new CursorNavigationState();
                    state.x = x;
                    return state;
                };
                /**
                 * Move towards the end of the line. Typically used after hitting the End key.
                 */
                CursorNavigationState.endOfLine = new CursorNavigationState();
                /**
                 * Move towards the beginning of the line.  Typically used after hitting the Home key.
                 */
                CursorNavigationState.beginningOfLine = new CursorNavigationState();
                return CursorNavigationState;
            })();
            Internal.CursorNavigationState = CursorNavigationState;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=CursorNavigationState.js.map