var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            var HtmlUtils = TextRight.Utils.HtmlUtils;
            /**
             * A cursor pointing to a place between two characters.
             */
            var DocumentCursor = (function () {
                /**
                 * Constructor.
                 */
                function DocumentCursor(block, spanElement, textNode) {
                    this.block = block;
                    this.spanElement = spanElement;
                    this.textNode = textNode;
                }
                /**
                 * Update the cursor to point at the same location as the other cursor
                 */
                DocumentCursor.prototype.cloneFrom = function (cursor) {
                    this.setTo(cursor.block, cursor.spanElement, cursor.textNode);
                };
                /**
                 * Update the cursor to point at the given position
                 */
                DocumentCursor.prototype.setTo = function (block, spanElement, textNode) {
                    this.block = block;
                    this.spanElement = spanElement;
                    this.textNode = textNode;
                };
                /**
                 * Verify that the various getters do not throw any exceptions, as they never should.
                 * Used for debugging purposes
                 *
                 * @returns undefined value that has no meaning
                 */
                DocumentCursor.prototype.validate = function () {
                    if (this.spanElement.parentElement.parentElement !== this.block.containerElement)
                        throw "Incorrect container element";
                    // access each getter (ors don't really matter)
                    var isValid = 0 | this.isBeginningOfBlock | this.isEndOfBlock | this.block.isBeginningOfDocument | this.block.isEndOfDocument;
                    return isValid;
                };
                /**
                 * Makes a deep copy of this object.
                 * @return A copy of this object.
                 */
                DocumentCursor.prototype.clone = function () {
                    return new DocumentCursor(this.block, this.spanElement, this.textNode);
                };
                Object.defineProperty(DocumentCursor.prototype, "isBeginningOfBlock", {
                    /**
                     * True if the cursor is currently pointing to just before the first element in the
                     * block.
                     */
                    get: function () {
                        return this.textNode == null && this.previousSpan.classList.contains(Internal.ElementClasses.firstChildElement);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DocumentCursor.prototype, "isEndOfBlock", {
                    /**
                     * True if the cursor is currently pointing to the last element in the block.
                     */
                    get: function () {
                        if (!this.isEndOfSpan) {
                            return false;
                        }
                        return this.nextSpan.classList.contains(Internal.ElementClasses.lastChildElement);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DocumentCursor.prototype, "nextNode", {
                    /**
                     * The next node that will be selected if the cursor is advanced forward. Returns null
                     * if at the end of the block.
                     */
                    get: function () {
                        if (this.isBeginningOfBlock) {
                            return this.spanElement.firstChild;
                        }
                        if (this.isEndOfBlock) {
                            return null;
                        }
                        if (this.isEndOfSpan) {
                            return this.nextSpan.firstChild;
                        }
                        else {
                            return this.textNode.nextSibling;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DocumentCursor.prototype, "previousSpan", {
                    get: function () {
                        return this.spanElement.previousElementSibling;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DocumentCursor.prototype, "nextSpan", {
                    get: function () {
                        return this.spanElement.nextElementSibling;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(DocumentCursor.prototype, "isEndOfSpan", {
                    /**
                     * True if the cursor is currently pointing at the last child of the
                     * current span
                     */
                    get: function () {
                        return this.textNode === this.spanElement.lastChild;
                    },
                    enumerable: true,
                    configurable: true
                });
                /** Gets the position of the cursor if it was to be drawn. */
                DocumentCursor.prototype.getCursorPosition = function () {
                    if (this.isBeginningOfBlock) {
                        // the only thing we have a position of is the first span
                        return Internal.PointPosition.rightOf(this.previousSpan.getBoundingClientRect());
                    }
                    if (this.isEndOfBlock) {
                        // we don't have a nextNode so the block below will not work
                        return Internal.PointPosition.rightOf(HtmlUtils.getBoundingClientRectOf(this.textNode));
                    }
                    var rect = HtmlUtils.getBoundingClientRectOf(this.textNode);
                    var nextRect = HtmlUtils.getBoundingClientRectOf(this.nextNode);
                    var point;
                    // TODO fix bug that occurs when at end of line and IE shows a double height line.
                    if (nextRect.top > rect.top) {
                        // the next character would end up on the next line.  This occurs most often
                        // when we're at the end of "virtual" line in the paragraph, and we have a
                        // space character. The position of the next character is actually on
                        // the next line, and so we re-position the cursor there
                        point = Internal.PointPosition.leftOf(nextRect);
                    }
                    else {
                        point = Internal.PointPosition.rightOf(rect);
                    }
                    return point;
                };
                /* Add the given element at the cursor position, after the next element. */
                DocumentCursor.prototype.add = function (element) {
                    if (this.isBeginningOfBlock) {
                        this.spanElement.insertBefore(element, this.spanElement.firstChild);
                    }
                    else {
                        this.spanElement.insertBefore(element, this.textNode.nextSibling);
                    }
                };
                /** Moves the position to the beginning of the given paragraph. */
                DocumentCursor.prototype.moveToBeginningOf = function (block) {
                    this.block = block;
                    this.spanElement = block.firstContentSpan;
                    this.textNode = null;
                };
                /**
                 * Moves the cursor to the end of the designated block.
                 */
                DocumentCursor.prototype.moveToEndOf = function (block) {
                    this.block = block;
                    this.spanElement = block.lastContentSpan;
                    this.textNode = this.spanElement.lastChild;
                };
                /**
                * Moves the cursor forward within the current block if not already at the
                * beginning of the paragraph.
                * @return true if moved forward, false if it could not because it was already
                *         at the end of the block.
                */
                DocumentCursor.prototype.moveForwardInBlock = function () {
                    if (this.isEndOfBlock) {
                        return false;
                    }
                    // NOTE: the following logic requires that empty spans do not exist
                    if (this.isBeginningOfBlock) {
                        this.textNode = this.spanElement.firstChild;
                    }
                    else if (this.isEndOfSpan) {
                        this.spanElement = this.nextSpan;
                        this.textNode = this.spanElement.firstChild;
                    }
                    else {
                        this.textNode = this.textNode.nextSibling;
                    }
                    return true;
                };
                /**
                 * Moves the cursor backwards within the current block if not already at the
                 * end of the paragraph.
                 * @return true if moved backwards, false if it could not because it was
                 *         already at the beginning of the block.
                 */
                DocumentCursor.prototype.moveBackwardInBlock = function () {
                    if (this.isBeginningOfBlock) {
                        return false;
                    }
                    // NOTE: the following logic requires that empty spans do not exist
                    this.textNode = this.textNode.previousSibling;
                    // we're at the beginning of a span (but not the beginning of the block) , so fix it
                    // up to look at the last text part of the previous span.
                    if (!this.isBeginningOfBlock && this.textNode === null) {
                        this.spanElement = this.previousSpan;
                        this.textNode = this.spanElement.lastChild;
                    }
                    return true;
                };
                /**
                  * Moves the cursor backwards through the document.
                  * @return true if the cursor was moved backwards, false if it could not be
                  *         moved because it is already at the beginning of the document.
                  */
                DocumentCursor.prototype.moveBackwards = function () {
                    if (!this.moveBackwardInBlock()) {
                        var block = this.block;
                        if (block.isBeginningOfDocument) {
                            // can't do anything, we're at the beginning
                            return false;
                        }
                        this.moveToEndOf(block.previousBlock);
                    }
                    return true;
                };
                /**
                 * Moves the cursor forward through the document.
                 * @return true if the cursor was moved forward, false if it could not be
                 *         moved because it is already at the end of the document.
                 */
                DocumentCursor.prototype.moveForward = function () {
                    if (!this.moveForwardInBlock()) {
                        // only fails if we're at the end
                        var block = this.block;
                        if (block.isEndOfDocument) {
                            // can't do anything, we're at the end
                            return false;
                        }
                        this.moveToBeginningOf(block.nextBlock);
                    }
                    return true;
                };
                /**
                * Move the cursor up in the document.
                * @param {CursorNavigationState} how to move the cursor upwards.
                */
                DocumentCursor.prototype.moveUpwards = function (state) {
                    if (state === void 0) { state = null; }
                    if (state == null) {
                        state = Internal.CursorNavigationState.fromPosition(this.getCursorPosition().left);
                    }
                    var iterator = this.clone();
                    if (iterator.moveToEndOfPreviousLine()) {
                        iterator.moveUsingState(state);
                        this.cloneFrom(iterator);
                    }
                };
                /**
                * Move the cursor down in the document.
                * @param {CursorNavigationState} how to move the cursor downwards.
                */
                DocumentCursor.prototype.moveDownwards = function (state) {
                    if (state === void 0) { state = null; }
                    if (state == null) {
                        state = Internal.CursorNavigationState.fromPosition(this.getCursorPosition().left);
                    }
                    var iterator = this.clone();
                    if (iterator.moveToBeginningOfNextLine()) {
                        iterator.moveUsingState(state);
                        this.cloneFrom(iterator);
                    }
                };
                /**
                 * Move to the beginning of the current line.
                 * @return true if the cursor moved.
                 */
                DocumentCursor.prototype.moveToBeginningOfLine = function () {
                    var originalPosition = this.getCursorPosition();
                    var numTurns = 0;
                    while (this.moveBackwardInBlock()) {
                        numTurns++;
                        if (!this.getCursorPosition().isInlineWith(originalPosition)) {
                            break;
                        }
                    }
                    switch (numTurns) {
                        case 0:
                            // didn't move at all
                            return false;
                        case 1:
                            if (!this.isBeginningOfBlock) {
                                // moved, but moved onto another line
                                this.moveForwardInBlock();
                            }
                            return false;
                        default:
                            if (!this.isBeginningOfBlock) {
                                // moved, but moved onto another line
                                this.moveForwardInBlock();
                            }
                            return true;
                    }
                };
                /**
                 * Move the cursor to the beginning of the next line, even if that line exists
                 * in the next block.
                 * @return true if the cursor moved.
                 */
                DocumentCursor.prototype.moveToBeginningOfNextLine = function () {
                    var iterator = this.clone();
                    iterator.moveToEndOfLine();
                    // then move one past that
                    if (!iterator.moveForward()) {
                        return false;
                    }
                    // if it was successful, then use that
                    this.cloneFrom(iterator);
                    return true;
                };
                /**
                 * Move to the end of the current line.
                 * @return true if the cursor moved
                 */
                DocumentCursor.prototype.moveToEndOfLine = function () {
                    var originalPosition = this.getCursorPosition();
                    var numTurns = 0;
                    while (this.moveForwardInBlock()) {
                        numTurns++;
                        if (!this.getCursorPosition().isInlineWith(originalPosition)) {
                            break;
                        }
                    }
                    switch (numTurns) {
                        case 0:
                            // didn't move at all
                            return false;
                        case 1:
                            if (!this.isEndOfBlock) {
                                // moved, but moved onto another line
                                this.moveBackwardInBlock();
                            }
                            return false;
                        default:
                            if (!this.isEndOfBlock) {
                                // moved, but moved onto another line
                                this.moveBackwardInBlock();
                            }
                            return true;
                    }
                };
                /**
                 * Move to the end of the previous line, even if the previous line exists in
                 * another block.
                 * @return true if the cursor moved.
                 */
                DocumentCursor.prototype.moveToEndOfPreviousLine = function () {
                    var iterator = this.clone();
                    iterator.moveToBeginningOfLine();
                    if (!iterator.moveBackwards()) {
                        return false;
                    }
                    this.cloneFrom(iterator);
                    return true;
                };
                /**
                 * Move towards the given x,y coordinate, staying within the current block
                 */
                DocumentCursor.prototype.moveTowardsPosition = function (x, y) {
                    var iterator = this.clone();
                    var position = iterator.getCursorPosition();
                    while (y > position.top + position.height) {
                        if (!iterator.moveForwardInBlock()) {
                            break;
                        }
                        position = iterator.getCursorPosition();
                    }
                    iterator.moveTowards(x);
                    this.cloneFrom(iterator);
                };
                /**
                 * Move the cursor towards the given x coordinate
                 * @param {number} x location where the cursor is desired
                 * @return true if the cursor moved
                 */
                DocumentCursor.prototype.moveTowards = function (x) {
                    var didMove = false;
                    var iterator = this.clone();
                    var currentPosition = this.getCursorPosition();
                    var bestMatch = iterator.clone();
                    // instead of having two functions (one that moves forwards towards the point
                    // and one that moves backwards towards the point), determine which direction
                    // we have to move, and assign a function that moves the iterator in that
                    // direction
                    var distanceToDesired = currentPosition.left - x;
                    var areWeCurrentlyAfterTheDesiredLocation = distanceToDesired > 0;
                    // we could already be as close as we're going to get
                    var bestDistance = Math.abs(distanceToDesired);
                    // yeah, we're already there!
                    if (distanceToDesired === 0) {
                        return false;
                    }
                    var iterate;
                    if (areWeCurrentlyAfterTheDesiredLocation) {
                        iterate = function (iter) { return iter.moveBackwardInBlock(); };
                    }
                    else {
                        iterate = function (iter) { return iter.moveForwardInBlock(); };
                    }
                    while (iterate(iterator)) {
                        var loc = iterator.getCursorPosition();
                        // oops, we went too far back
                        if (!loc.isInlineWith(currentPosition)) {
                            break;
                        }
                        didMove = true;
                        var distance = loc.distanceTo(x);
                        if (distance < bestDistance) {
                            bestMatch = iterator.clone();
                            bestDistance = iterator.getCursorPosition().distanceTo(x);
                        }
                    }
                    if (!didMove) {
                        return false;
                    }
                    this.cloneFrom(bestMatch);
                    return true;
                };
                DocumentCursor.prototype.removeNextInBlock = function () {
                    var next = this.nextNode;
                    var span = next.parentNode;
                    span.removeChild(next);
                    return true;
                };
                /**
                 * Move the cursor using the given state object, moving towards a given point,
                 * towards the beginning of the line, or towards the end of the line.
                 */
                DocumentCursor.prototype.moveUsingState = function (state) {
                    if (state === Internal.CursorNavigationState.beginningOfLine) {
                        this.moveToBeginningOfLine();
                    }
                    else if (state === Internal.CursorNavigationState.endOfLine) {
                        this.moveToEndOfLine();
                    }
                    else {
                        this.moveTowards(state.x);
                    }
                };
                return DocumentCursor;
            })();
            Internal.DocumentCursor = DocumentCursor;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=DocumentCursor.js.map