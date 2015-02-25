var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            var HtmlUtils = TextRight.Utils.HtmlUtils;
            var MathUtils = TextRight.Utils.MathUtils;
            var DocumentModel = (function () {
                /**
                 * Create a new editable document from a div element
                 * @note all children of the element will be removed/replace to make
                 * an editable document.
                 * @param {HTMLDivElement} element The element to make a document out of.
                 * @return A block representing the beginning of the document.
                 */
                function DocumentModel(element) {
                    this.element = element;
                    // we're gonna put the text back later
                    var text = element.textContent;
                    // make sure the element is empty
                    HtmlUtils.clearChildren(element);
                    this.firstBlockIndicator = HtmlUtils.appendNewElement(element, "div", Internal.ElementClasses.firstBlock);
                    this.lastBlockIndicator = HtmlUtils.appendNewElement(element, "div", Internal.ElementClasses.lastBlock);
                    // fake block to insert the first block
                    var first = new Internal.BlockItem(element.children[0]);
                    var block = Internal.BlockItem.createNewBlock();
                    Internal.EditDocument.insertBlockAfter(first, block);
                    Internal.EditDocument.insertText(block.beginning, text);
                    this.undoStack = new UndoStack();
                }
                /**
                 * Get the offset between getBoundingClientRect() and the top of the element.  This is
                 * used primarily for anything that calls getBoundingClientRect() and needs to position
                 * things accordingly. getBoundingClientRect() returns client coordinates while
                 * absolutely positioned items need page offset.  So by adding the offset acquired by
                 * this method, you can translate your client rect to a page rect.
                 * @return The offset between client coordinates and page coordinates.
                 */
                DocumentModel.prototype.getOffset = function () {
                    var doc = this.element;
                    var client = doc.getBoundingClientRect();
                    var diffTop = doc.offsetTop - client.top;
                    var diffLeft = doc.offsetLeft - client.left;
                    return {
                        left: diffLeft,
                        top: diffTop
                    };
                };
                Object.defineProperty(DocumentModel.prototype, "rawElement", {
                    /**
                     * The html div element that represents the top-level document container
                     */
                    get: function () {
                        return this.element;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DocumentModel.prototype, "firstBlock", {
                    /**
                     * The first block item in the document
                     */
                    get: function () {
                        return new Internal.BlockItem(this.firstBlockIndicator.nextElementSibling);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DocumentModel.prototype, "lastBlock", {
                    /**
                     * The last block item in the document
                     */
                    get: function () {
                        return new Internal.BlockItem(this.lastBlockIndicator.previousElementSibling);
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Check if the given x/y coordinates are part of this document
                 */
                DocumentModel.prototype.isCoordinatesInsideDocument = function (x, y) {
                    var rect = this.element.getBoundingClientRect();
                    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
                };
                /**
                 * Gets a cursor that represents the given x/y coordinates for this document
                 */
                DocumentModel.prototype.getCursorFromLocation = function (x, y) {
                    var rect = this.element.getBoundingClientRect();
                    // clamp it inside the document bounds... 
                    x = MathUtils.clamp(x, rect.left, rect.right);
                    y = MathUtils.clamp(y, rect.top, rect.bottom);
                    var element = document.elementFromPoint(x, y);
                    if (Internal.EditDocument.isSpan(element)) {
                        // search through to find the span
                        var position = new Internal.DocumentCursor(Internal.EditDocument.blockFromSpan(element), element, element.firstChild);
                        position.moveTowardsPosition(x, y);
                        return position;
                    }
                    else if (Internal.EditDocument.isBlock(element) || Internal.EditDocument.isBlockContent(element)) {
                        var blockElement = Internal.EditDocument.isBlock(element) ? element : element.parentNode;
                        var block = new Internal.BlockItem(blockElement);
                        return this.getCursorForPositionForBlock(x, y, block);
                    }
                    else {
                        var firstBlock = this.firstBlock;
                        var beginPosition = this.firstBlock.containerElement.getBoundingClientRect().top;
                        var endPosition = this.lastBlock.containerElement.getBoundingClientRect().bottom;
                        if (y < beginPosition) {
                            return this.getCursorForPositionForBlock(x, y, this.firstBlock);
                        }
                        else if (y >= endPosition) {
                            return this.getCursorForPositionForBlock(x, y, this.lastBlock);
                        }
                        else {
                            console.error("{A91266BD-CFD1-4C8F-AE57-76FBBD9613F6}", element, x, y);
                        }
                    }
                    return null;
                };
                /**
                 * Get a cursor that represents a location close to the given x/y value within the block
                 */
                DocumentModel.prototype.getCursorForPositionForBlock = function (x, y, block) {
                    var contentRect = block.containerElement.getBoundingClientRect();
                    x = MathUtils.clamp(x, contentRect.left, contentRect.right);
                    y = MathUtils.clamp(y, contentRect.top, contentRect.bottom);
                    // TODO optimize so that we don't go through EVERY span and so that
                    // if we're towards the end, we start from the beginning
                    var cursor = block.beginning;
                    cursor.moveTowardsPosition(x, y);
                    return cursor;
                };
                /**
                 * Insert text into the document at the specified location
                 */
                DocumentModel.prototype.insertText = function (cursor, text) {
                    // TODO fix and try to actually implement this
                    if (cursor != null) {
                        return Internal.EditDocument.insertText(cursor, text);
                    }
                    // TODO check if we already inserted text elsewhere
                    // TODO handle newlines
                    var event = new InsertTextEvent();
                    event.timeStart = DateUtils.timestamp;
                    event.timeEnd = DateUtils.timestamp;
                    event.text = text;
                    return Internal.EditDocument.insertText(cursor, text);
                };
                return DocumentModel;
            })();
            Internal.DocumentModel = DocumentModel;
            var UndoStackNode = (function () {
                function UndoStackNode(event, previous) {
                    this.event = event;
                    this.previous = previous;
                }
                return UndoStackNode;
            })();
            var UndoStack = (function () {
                function UndoStack() {
                }
                Object.defineProperty(UndoStack.prototype, "isEmpty", {
                    get: function () {
                        return this.last == null;
                    },
                    enumerable: true,
                    configurable: true
                });
                UndoStack.prototype.push = function (event) {
                    this.last = new UndoStackNode(this.last, event);
                };
                UndoStack.prototype.peek = function () {
                    return this.last.event;
                };
                return UndoStack;
            })();
            Internal.UndoStack = UndoStack;
            var DateUtils = (function () {
                function DateUtils() {
                }
                Object.defineProperty(DateUtils, "timestamp", {
                    get: function () {
                        return Date.now();
                    },
                    enumerable: true,
                    configurable: true
                });
                return DateUtils;
            })();
            Internal.DateUtils = DateUtils;
            var UndoEvent = (function () {
                function UndoEvent() {
                }
                return UndoEvent;
            })();
            Internal.UndoEvent = UndoEvent;
            var InsertTextEvent = (function () {
                function InsertTextEvent() {
                }
                return InsertTextEvent;
            })();
            /**
             * Indicates the number of times something has changed.
             */
            var ChangeCount = (function () {
                function ChangeCount() {
                    this.value = 0;
                }
                Object.defineProperty(ChangeCount.prototype, "current", {
                    get: function () {
                        return this.value;
                    },
                    enumerable: true,
                    configurable: true
                });
                ChangeCount.prototype.increment = function () {
                    this.value++;
                    return this.value;
                };
                return ChangeCount;
            })();
            Internal.ChangeCount = ChangeCount;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=DocumentModel.js.map