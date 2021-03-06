var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            var StringUtils = TextRight.Utils.StringUtils;
            var EventHandlers = TextRight.Internal.EventHandlers;
            /**
             * Processes key and mouse events, forwarding various events to the provided
             * handler
             */
            var DocumentInputProcessor = (function () {
                function DocumentInputProcessor(documentElement, element, handler) {
                    var _this = this;
                    this.documentElement = documentElement;
                    this.element = element;
                    this.handler = handler;
                    /**
                     * The input the last time we queried the element.
                     */
                    this.lastInput = "";
                    this.isPasteIncoming = false;
                    this.isCutIncoming = false;
                    if (element == null)
                        throw "Not a valid element";
                    this.mouseDown = EventHandlers.from(documentElement, "mousedown", function (evt) { return _this.handleMouseDown(evt); }, true);
                    this.mouseMove = EventHandlers.from(documentElement, "mousemove", function (evt) { return _this.handleMouseMove(evt); });
                    this.mouseUp = EventHandlers.fromMany([documentElement, window], "mouseup", function (evt) { return _this.handleMouseUp(evt); });
                    EventHandlers.from(element, "keydown", function (evt) { return _this.handleKeyDown(evt); }, true);
                    // TODO reduce interval when we can (exponential back off?)
                    setInterval(function () { return _this.readInput(); }, 50);
                }
                DocumentInputProcessor.prototype.readInput = function () {
                    // TODO bail out fast if we're not focused
                    // TODO handle PASTE incoming
                    var text = this.element.value;
                    var prevInput = this.lastInput;
                    // If nothing changed, bail.
                    if (text === prevInput)
                        return false;
                    // ::::::::CODEMIRROR::::::::
                    //  if (text.charCodeAt(0) == 0x200b && doc.sel == cm.display.selForContextMenu && !prevInput)
                    //      prevInput = "\u200b";
                    var same = 0;
                    var length = Math.min(prevInput.length, text.length);
                    while (same < length && prevInput.charCodeAt(same) === text.charCodeAt(same)) {
                        ++same;
                    }
                    var inserted = text.slice(same);
                    var textLines = StringUtils.splitLines(inserted);
                    if (same < prevInput.length) {
                        debugger;
                    }
                    else {
                        this.handler.handleTextAddition(inserted);
                    }
                    // Don't leave long text in the textarea, since it makes further polling slow
                    if (text.length > 5 || text.indexOf("\n") > -1) {
                        this.element.value = "";
                        this.lastInput = "";
                    }
                    else {
                        this.lastInput = text;
                    }
                    this.isPasteIncoming = false;
                    this.isCutIncoming = false;
                    return true;
                };
                /* Handle the case where the user is selecting text */
                DocumentInputProcessor.prototype.handleMouseDown = function (evt) {
                    if (evt.button !== 0)
                        return;
                    evt.preventDefault();
                    var shouldExtendSelections = evt.shiftKey;
                    this.handler.setCaret(evt.pageX, evt.pageY, shouldExtendSelections);
                    this.mouseMove.enable();
                    this.mouseUp.enable();
                };
                /* Handle the case where the user is selecting text */
                DocumentInputProcessor.prototype.handleMouseMove = function (evt) {
                    if (evt.button !== 0)
                        return;
                    evt.preventDefault();
                    this.handler.setCaret(evt.pageX, evt.pageY, true);
                };
                /* Handle the case where the user stopped the selection */
                DocumentInputProcessor.prototype.handleMouseUp = function (evt) {
                    if (evt.button !== 0)
                        return;
                    evt.preventDefault();
                    this.mouseMove.disable();
                    this.mouseUp.disable();
                };
                /** Handle the case where the user pressed a key down. */
                DocumentInputProcessor.prototype.handleKeyDown = function (evt) {
                    var isCtrlDown = evt.ctrlKey;
                    var shouldExtendSelections = evt.shiftKey;
                    switch (evt.keyCode) {
                        case KeyboardConstants.left:
                            if (isCtrlDown) {
                                this.handler.navigateWordLeft(shouldExtendSelections);
                            }
                            else {
                                this.handler.navigateLeft(shouldExtendSelections);
                            }
                            evt.preventDefault();
                            break;
                        case KeyboardConstants.right:
                            if (isCtrlDown) {
                                this.handler.navigateWordRight(shouldExtendSelections);
                            }
                            else {
                                this.handler.navigateRight(shouldExtendSelections);
                            }
                            evt.preventDefault();
                            break;
                        case KeyboardConstants.up:
                            if (isCtrlDown) {
                                this.handler.navigateBlockUp(shouldExtendSelections);
                            }
                            else {
                                this.handler.moveUp(shouldExtendSelections);
                            }
                            evt.preventDefault();
                            break;
                        case KeyboardConstants.down:
                            if (isCtrlDown) {
                                this.handler.navigateBlockDown(shouldExtendSelections);
                            }
                            else {
                                this.handler.moveDown(shouldExtendSelections);
                            }
                            evt.preventDefault();
                            break;
                        case KeyboardConstants.backspace:
                            this.handler.handleBackspace();
                            evt.preventDefault();
                            break;
                        case KeyboardConstants.deleteKey:
                            this.handler.handleDelete();
                            evt.preventDefault();
                            break;
                        case KeyboardConstants.enter:
                            this.handler.handleEnter();
                            evt.preventDefault();
                            break;
                        case KeyboardConstants.end:
                            this.handler.handleEnd(shouldExtendSelections);
                            evt.preventDefault();
                            break;
                        case KeyboardConstants.home:
                            this.handler.handleHome(shouldExtendSelections);
                            evt.preventDefault();
                            break;
                    }
                };
                return DocumentInputProcessor;
            })();
            Internal.DocumentInputProcessor = DocumentInputProcessor;
            var KeyboardConstants = (function () {
                function KeyboardConstants() {
                }
                KeyboardConstants.backspace = 8;
                KeyboardConstants.deleteKey = 46;
                KeyboardConstants.left = 37;
                KeyboardConstants.up = 38;
                KeyboardConstants.right = 39;
                KeyboardConstants.down = 40;
                KeyboardConstants.enter = 13;
                KeyboardConstants.end = 35;
                KeyboardConstants.home = 36;
                return KeyboardConstants;
            })();
            Internal.KeyboardConstants = KeyboardConstants;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=DocumentInputProcessor.js.map