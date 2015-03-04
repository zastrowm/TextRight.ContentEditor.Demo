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
                    this.caretLocation = this.documentModel.firstBlock.beginning;
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
                    this.caretLocation = this.documentModel.insertText(this.caretLocation, text);
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
                            this.selectionStart = this.caretLocation.clone();
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
                    this.caretPresenter.updateCaretLocation(this.caretLocation);
                    if (this.hasSelection) {
                        this.selectionPresenter.update(this.selectionStart, this.caretLocation);
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
                DocumentView.prototype.setCaret = function (x, y, shouldExtendSelection) {
                    this.inputTextArea.focus();
                    this.setSelectionMode(shouldExtendSelection);
                    // move to the designated location
                    var position = this.documentModel.getCursorFromLocation(x, y);
                    if (position != null) {
                        this.caretLocation = position;
                        this.caretLocation.block;
                        this.markCursorMovedWithoutState();
                    }
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.moveUp = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (this.movementState == null) {
                        this.movementState = Internal.CursorNavigationState.fromPosition(this.caretLocation.getCursorPosition().left);
                    }
                    this.caretLocation.moveUpwards(this.movementState);
                    this.markCursorMovedWithState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.moveDown = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (this.movementState == null) {
                        this.movementState = Internal.CursorNavigationState.fromPosition(this.caretLocation.getCursorPosition().left);
                    }
                    this.caretLocation.moveDownwards(this.movementState);
                    this.markCursorMovedWithState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateLeft = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    this.caretLocation.moveBackwards();
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateRight = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    this.caretLocation.moveForward();
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateWordLeft = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (this.caretLocation.isBeginningOfBlock) {
                        if (!this.caretLocation.block.isBeginningOfDocument) {
                            this.caretLocation.moveToEndOf(this.caretLocation.block.previousBlock);
                        }
                    }
                    else {
                        var cursor = this.caretLocation;
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
                    if (this.caretLocation.isEndOfBlock) {
                        if (!this.caretLocation.block.isEndOfDocument) {
                            this.caretLocation.moveToBeginningOf(this.caretLocation.block.nextBlock);
                        }
                    }
                    else {
                        var cursor = this.caretLocation;
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
                    if (!this.caretLocation.isBeginningOfBlock) {
                        this.caretLocation.moveToBeginningOf(this.caretLocation.block);
                    }
                    else if (this.caretLocation.isBeginningOfBlock) {
                        if (!this.caretLocation.block.isBeginningOfDocument) {
                            this.caretLocation.moveToBeginningOf(this.caretLocation.block.previousBlock);
                        }
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.navigateBlockDown = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    if (!this.caretLocation.block.isEndOfDocument) {
                        this.caretLocation.moveToBeginningOf(this.caretLocation.block.nextBlock);
                    }
                    else {
                        this.caretLocation.moveToEndOf(this.caretLocation.block);
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleEnd = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    this.movementState = Internal.CursorNavigationState.endOfLine;
                    this.caretLocation.moveToEndOfLine();
                    this.markCursorMovedWithState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleHome = function (shouldExtendSelection) {
                    this.setSelectionMode(shouldExtendSelection);
                    this.movementState = Internal.CursorNavigationState.beginningOfLine;
                    this.caretLocation.moveToBeginningOfLine();
                    this.markCursorMovedWithState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleBackspace = function () {
                    this.setSelectionMode(false);
                    if (this.hasSelection) {
                        this.caretLocation = this.documentModel.removeBetween(this.selectionStart, this.caretLocation);
                    }
                    else if (this.caretLocation.isBeginningOfBlock) {
                        var block = this.caretLocation.block;
                        if (block.isBeginningOfDocument) {
                            // can't do anything, we're at the beginning
                            return;
                        }
                        // TODO handle parents/children
                        this.caretLocation = this.documentModel.mergeBlocks(block.previousBlock, block);
                    }
                    else {
                        this.caretLocation.moveBackwardInBlock();
                        this.caretLocation.removeNextInBlock();
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleDelete = function () {
                    this.setSelectionMode(false);
                    if (this.hasSelection) {
                        this.caretLocation = this.documentModel.removeBetween(this.selectionStart, this.caretLocation);
                    }
                    else if (this.caretLocation.isEndOfBlock) {
                        var block = this.caretLocation.block;
                        if (block.isEndOfDocument) {
                            // can't do anything, we're at the end
                            return;
                        }
                        this.caretLocation = this.documentModel.mergeBlocks(block, block.nextBlock);
                    }
                    else {
                        this.caretLocation.removeNextInBlock();
                    }
                    this.markCursorMovedWithoutState();
                };
                /* @inherit from IInputHandler */
                DocumentView.prototype.handleEnter = function () {
                    // TODO handle selected text
                    this.setSelectionMode(false);
                    this.documentModel.splitBlock(this.caretLocation);
                    this.caretLocation.moveForward();
                    this.markCursorMovedWithoutState();
                };
                return DocumentView;
            })();
            Internal.DocumentView = DocumentView;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=DocumentView.js.map