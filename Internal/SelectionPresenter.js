var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            var HtmlUtils = TextRight.Utils.HtmlUtils;
            /**
             * Manages the current selection and the elements that make up the current selection.
             */
            var SelectionPresenter = (function () {
                /**
                 * Create a new selection view
                 * @param document the element that represents the view of the document
                 */
                function SelectionPresenter(documentModel) {
                    this.documentModel = documentModel;
                    var document = documentModel.rawElement;
                    this.elementTop = HtmlUtils.appendNewElement(document, "DIV", Internal.ElementClasses.selectionTop);
                    this.elementMid = HtmlUtils.appendNewElement(document, "DIV", Internal.ElementClasses.selectionMiddle);
                    this.elementBot = HtmlUtils.appendNewElement(document, "DIV", Internal.ElementClasses.selectionBottom);
                }
                /**
                 * Update the display of the selected text
                 *
                 * @param selectionStart the cursor the represents the start of the selection
                 * @param selectionEnd the cursor that represents the end of the selection
                 * @note that the start and end do not necessarily need to be in order
                 */
                SelectionPresenter.prototype.update = function (selectionStart, selectionEnd) {
                    var endPosition = selectionEnd.getCursorPosition();
                    var startPosition = selectionStart.getCursorPosition();
                    var endBlock = selectionEnd.block.contentElement.getBoundingClientRect();
                    var startBlock = selectionStart.block.contentElement.getBoundingClientRect();
                    var isOnSameLine = startPosition.isInlineWith(endPosition);
                    var isStartBeforeEnd = isOnSameLine ? startPosition.left < endPosition.left : startPosition.top < endPosition.top;
                    if (!isStartBeforeEnd) {
                        // Swap the two so that we can always work with start being at the top
                        var tmp = startPosition;
                        startPosition = endPosition;
                        endPosition = tmp;
                        var tmp2 = startBlock;
                        startBlock = endBlock;
                        endBlock = tmp2;
                    }
                    // TODO find out how RTL changes the display of the selection
                    var rightMost = Math.max(startPosition.left, endPosition.left, startBlock.right, endBlock.right);
                    var leftMost = Math.min(startPosition.left, endPosition.left, startBlock.left, endBlock.left);
                    var heightOfMiddle = endPosition.top - startPosition.top - startPosition.height;
                    var offset = this.documentModel.getOffset();
                    if (isOnSameLine) {
                        // if the start and end selection are on the same line, we don't need 3 different parts to show the selection,
                        // we merely need a selection stretching from start to end
                        var height = Math.max(startPosition.height, endPosition.height);
                        var top = Math.min(startPosition.top, endPosition.top);
                        this.elementTop.style.top = (top + offset.top) + 'px';
                        this.elementTop.style.height = height + 'px';
                        this.elementTop.style.left = (startPosition.left + offset.left) + 'px';
                        this.elementTop.style.width = (endPosition.left - startPosition.left) + 'px';
                        this.elementTop.style.display = "block";
                        this.elementMid.style.display = "none";
                        this.elementBot.style.display = "none";
                    }
                    else {
                        // otherwise, we need to display 3 parts: the top which is on the line where the selection begins,
                        // the middle which stretches from the start line to the end line, and the bottom which is the line
                        // where the selection ends
                        // WASBUG make everything integers to prevent floating point errors in the display
                        // TODO could we round to nearest something else instead (like 0.5)?
                        var topTop = (startPosition.top) | 0;
                        var topHeight = (startPosition.height) | 0;
                        var midTop = (topTop + topHeight) | 0;
                        var midHeight = (heightOfMiddle) | 0;
                        var botTop = (midTop + midHeight) | 0;
                        // get rid of any cumulative rounding errors by adding in the error found thus far
                        var botHeight = (endPosition.top - botTop + endPosition.height) | 0;
                        HtmlUtils.positionElementWithOffset(this.elementTop, offset, topTop, startPosition.left, topHeight, rightMost - startPosition.left);
                        this.elementTop.style.display = "block";
                        HtmlUtils.positionElementWithOffset(this.elementMid, offset, midTop, leftMost, midHeight, rightMost - leftMost);
                        this.elementMid.style.display = "block";
                        HtmlUtils.positionElementWithOffset(this.elementBot, offset, botTop, leftMost, botHeight, endPosition.left - leftMost);
                        this.elementBot.style.display = "block";
                    }
                };
                /**
                 * Turn of the selection so that it is no longer visible
                 *
                 * To turn the selection back on, use update(start, end)
                 */
                SelectionPresenter.prototype.disable = function () {
                    this.elementTop.style.display = "none";
                    this.elementMid.style.display = "none";
                    this.elementBot.style.display = "none";
                };
                /* Get the offset of the given node as if the node was going to be used as the start or end of a range. */
                SelectionPresenter.prototype.getOffset = function (node) {
                    if (node == null)
                        return 0;
                    return TextRight.Utils.HtmlUtils.findOffsetOf(node) + 1;
                };
                return SelectionPresenter;
            })();
            Internal.SelectionPresenter = SelectionPresenter;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=SelectionPresenter.js.map