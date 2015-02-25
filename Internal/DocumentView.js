var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            var CharacterCategorizer = TextRight.Internal.CharacterCategorizer;
            /**
             * Wraps an element and allows editing, providing a cursor and handling
             * operations that modify the text within the element.
             */
            var DocumentView = (function () {
                /**
                 * Create a new DocumentView that handles the given div as an editable document
                 */
                function DocumentView(element) {
                    var _this = this;
                    this.element = element;
                    /** The state to use when moving up or down */
                    this.movementState = null;
                    this.characterCategorizer = CharacterCategorizer.instance;
                    this.documentModel = new Internal.DocumentModel(element);
                    this.cursorLocation = this.documentModel.firstBlock.beginning;
                    this.selectionStart = this.documentModel.firstBlock.beginning;
                    this.initializeTextArea();
                    this.caretPresenter = new Internal.CaretPresenter(this.documentModel, this.inputTextArea);
                    this.selectionPresenter = new TextRight.Editor.Internal.SelectionPresenter(this.documentModel);
                    this.markTyping();
                    this.redrawCaretAndSelection();
                    element.addEventListener('resize', function () { return _this.handleResize(); });
                    window.addEventListener('resize', function () { return _this.handleResize(); });
                    var inputProcessor = new Internal.DocumentInputProcessor(this.element, this.inputTextArea, this);
                }
                Object.defineProperty(DocumentView.prototype, "hasSelection", {
                    /** true if there is currently a selection. */
                    get: function () {
                        return this.selectionStart != null;
                    },
                    enumerable: true,
                    configurable: true
                });
                DocumentView.prototype.initializeTextArea = function () {
                    this.inputTextArea = document.createElement("textarea");
                    this.inputTextArea.classList.add(Internal.ElementClasses.textareaInput);
                    this.element.appendChild(this.inputTextArea);
                };
                DocumentView.prototype.markTyping = function () {
                    this.caretPresenter.markTextActivity();
                };
                DocumentView.prototype.focus = function () {
                    this.inputTextArea.focus();
                };
                DocumentView.prototype.handleResize = function () {
                    this.redrawCaretAndSelection();
                };
                /**
                 * Handles the events that occur when the text input has changed.
                 */
                DocumentView.prototype.handleTextAddition = function (text) {
                    this.cursorLocation = this.documentModel.insertText(this.cursorLocation, text);
                    this.setSelectionMode(false);
                    this.markCursorMovedWithoutState();
                };
                /**
                 * Set whether or not the document is maintaining a text selection (shouldMaintainSelection=true)
                 * or whether the document is simply displaying a cursor (shouldMaintainSelection=false)
                 */
                DocumentView.prototype.setSelectionMode = function (shouldMaintainSelection) {
                    if (shouldMaintainSelection) {
                        // selectionStart being null is the indicator that we don't have a selection
                        if (this.selectionStart == null) {
                            this.selectionStart = this.cursorLocation.clone();
                        }
                    }
                    else {
                        this.selectionStart = null;
                    }
                };
                /**
                 * Redraw the caret and current selection
                 */
                DocumentView.prototype.redrawCaretAndSelection = function () {
                    this.caretPresenter.updateCaretLocation(this.cursorLocation);
                    if (this.hasSelection) {
                        this.selectionPresenter.update(this.selectionStart, this.cursorLocation);
                    }
                    else {
                        this.selectionPresenter.disable();
                    }
                };
                /**
                 * Reset the movement state, redraw the caret and selection, and mark that we've been
                 * typing. Used as a convenience method to cut down on repetitive code.  Usually invoked
                 * from method that move the caret in a way that should cause the movement state to
                 * reset (for instance left or right arrow keys).
                 */
                DocumentView.prototype.markCursorMovedWithoutState = function () {
                    this.movementState = null;
                    this.redrawCaretAndSelection();
                    this.markTyping();
                };
                /**
                 * Redraw the caret and selection, and mark that we've been typing. Used as a convenience
                 * method to cut down on repetitive code.  Usually invoked from method that move the
                 * caret in a way that should NOT cause the movement state to reset (for instance up or down
                 * keys).
                 */
                DocumentView.prototype.markCursorMovedWithState = function () {
                    this.redrawCaretAndSelection();
                    this.markTyping();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleLeftMouseDown = function (x, y, shouldExtendSelection) {
                    this.inputTextArea.focus();
                    this.setSelectionMode(shouldExtendSelection);
                    this.moveCaretTo(x, y);
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleLeftMouseMove = function (x, y) {
                    this.inputTextArea.focus();
                    this.setSelectionMode(true);
                    this.moveCaretTo(x, y);
                };
                /** Move the caret to the designated point, if possible */
                DocumentView.prototype.moveCaretTo = function (x, y) {
                    var position = this.documentModel.getCursorFromLocation(x, y);
                    if (position != null) {
                        this.cursorLocation = position;
                        this.markCursorMovedWithoutState();
                    }
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.moveUp = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (this.movementState == null) {
                        this.movementState = Internal.CursorNavigationState.fromPosition(this.cursorLocation.getCursorPosition().left);
                    }
                    this.cursorLocation.moveUpwards(this.movementState);
                    this.markCursorMovedWithState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.moveDown = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (this.movementState == null) {
                        this.movementState = Internal.CursorNavigationState.fromPosition(this.cursorLocation.getCursorPosition().left);
                    }
                    this.cursorLocation.moveDownwards(this.movementState);
                    this.markCursorMovedWithState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateLeft = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    this.cursorLocation.moveBackwards();
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateRight = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    this.cursorLocation.moveForward();
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateWordLeft = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (this.cursorLocation.isBeginningOfBlock) {
                        if (!this.cursorLocation.block.isBeginningOfDocument) {
                            this.cursorLocation.moveToEndOf(this.cursorLocation.block.previousBlock);
                        }
                    }
                    else {
                        var cursor = this.cursorLocation;
                        var category;
                        do {
                            category = this.characterCategorizer.categorize(cursor.textNode.textContent);
                        } while (category < 0 && cursor.moveBackwardInBlock() && !cursor.isBeginningOfBlock);
                        var lastCategory;
                        do {
                            lastCategory = category;
                            // if we don't exit early, then textNode will be null
                            if (!cursor.moveBackwardInBlock() || cursor.isBeginningOfBlock) {
                                break;
                            }
                            var prevText = cursor.textNode.textContent;
                            category = this.characterCategorizer.categorize(prevText);
                        } while (lastCategory === category);
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateWordRight = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (this.cursorLocation.isEndOfBlock) {
                        if (!this.cursorLocation.block.isEndOfDocument) {
                            this.cursorLocation.moveToBeginningOf(this.cursorLocation.block.nextBlock);
                        }
                    }
                    else {
                        var cursor = this.cursorLocation;
                        var lastCategory;
                        var category;
                        category = this.characterCategorizer.categorize(cursor.nextNode.textContent);
                        do {
                            lastCategory = category;
                            // if we don't exit early, then nextNode will be null
                            if (!cursor.moveForwardInBlock() || cursor.isEndOfBlock) {
                                break;
                            }
                            var nextText = cursor.nextNode.textContent;
                            category = this.characterCategorizer.categorize(nextText);
                        } while (lastCategory === category || category < 0);
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateBlockUp = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (!this.cursorLocation.isBeginningOfBlock) {
                        this.cursorLocation.moveToBeginningOf(this.cursorLocation.block);
                    }
                    else if (this.cursorLocation.isBeginningOfBlock) {
                        if (!this.cursorLocation.block.isBeginningOfDocument) {
                            this.cursorLocation.moveToBeginningOf(this.cursorLocation.block.previousBlock);
                        }
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateBlockDown = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (!this.cursorLocation.block.isEndOfDocument) {
                        this.cursorLocation.moveToBeginningOf(this.cursorLocation.block.nextBlock);
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleEnd = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    this.movementState = Internal.CursorNavigationState.endOfLine;
                    this.cursorLocation.moveToEndOfLine();
                    this.markCursorMovedWithState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleHome = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    this.movementState = Internal.CursorNavigationState.beginningOfLine;
                    this.cursorLocation.moveToBeginningOfLine();
                    this.markCursorMovedWithState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleBackspace = function () {
                    this.setSelectionMode(false);
                    // todo handle selected text
                    if (this.cursorLocation.isBeginningOfBlock) {
                        var block = this.cursorLocation.block;
                        if (block.isBeginningOfDocument) {
                            // can't do anything, we're at the beginning
                            return;
                        }
                        // TODO handle parents/children
                        this.cursorLocation = Internal.EditDocument.mergeBlocks(block.previousBlock, block);
                    }
                    else {
                        this.cursorLocation.moveBackwardInBlock();
                        this.cursorLocation.removeNextInBlock();
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleDelete = function () {
                    this.setSelectionMode(false);
                    // todo handle selected text
                    if (this.cursorLocation.isEndOfBlock) {
                        var block = this.cursorLocation.block;
                        if (block.isEndOfDocument) {
                            // can't do anything, we're at the end
                            return;
                        }
                        this.cursorLocation = Internal.EditDocument.mergeBlocks(block, block.nextBlock);
                    }
                    else {
                        this.cursorLocation.removeNextInBlock();
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleEnter = function () {
                    // TODO handle selected text
                    this.setSelectionMode(false);
                    Internal.EditDocument.splitBlock(this.cursorLocation);
                    this.cursorLocation.moveForward();
                    this.markCursorMovedWithoutState();
                };
                return DocumentView;
            })();
            Internal.DocumentView = DocumentView;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=DocumentView.js.map