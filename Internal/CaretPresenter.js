var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            var DebouncingTimer = TextRight.Utils.DebouncingTimer;
            var HtmlUtils = TextRight.Utils.HtmlUtils;
            /**
             * Handles the presentation/handling of the caret
             */
            var CaretPresenter = (function () {
                /**
                 * @param documentModel the model for which the caret is being managed
                 * @param inputTextArea the input area that should move along with the caret
                 */
                function CaretPresenter(documentModel, inputTextArea) {
                    var _this = this;
                    this.documentModel = documentModel;
                    this.inputTextArea = inputTextArea;
                    this.cursorElement = HtmlUtils.appendNewElement(documentModel.rawElement, "DIV", Internal.ElementClasses.cursor);
                    this.blinkTimer = new DebouncingTimer(500, function () { return _this.toggleCursor(); });
                }
                /** Indicate that there is textual activity and so the caret should be solid. */
                CaretPresenter.prototype.markTextActivity = function () {
                    this.cursorElement.style.display = "block";
                    this.blinkTimer.trigger();
                };
                /**
                 * Update the position of the caret
                 */
                CaretPresenter.prototype.updateCaretLocation = function (cursor) {
                    var pos = cursor.getCursorPosition();
                    HtmlUtils.positionElement(this.cursorElement, pos.top, pos.left, pos.height, 1);
                    HtmlUtils.positionElement(this.inputTextArea, pos.top, pos.left, pos.height, 1);
                };
                /**
                 * Toggle the cursor to be hidden or shown depending on its previous state
                 */
                CaretPresenter.prototype.toggleCursor = function () {
                    var isHidden = this.cursorElement.style.display === "none";
                    this.cursorElement.style.display = isHidden ? "block" : "none";
                    this.blinkTimer.trigger();
                };
                return CaretPresenter;
            })();
            Internal.CaretPresenter = CaretPresenter;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=CaretPresenter.js.map