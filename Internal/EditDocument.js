var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            var HtmlUtils = TextRight.Utils.HtmlUtils;
            var carriageReturn = "\r";
            var newline = "\n";
            /**
             * Allows performing document-related operations on a given html document
             * using blocks and cursors.
             */
            var EditDocument = (function () {
                function EditDocument() {
                }
                /**
                 * Check if the given element represents a block
                 */
                EditDocument.isBlock = function (element) {
                    return element.nodeName === "BLOCK";
                };
                /**
                 * Check if the given element represents the content of a block (aka the
                 * paragraph in the block)
                 */
                EditDocument.isBlockContent = function (element) {
                    if (element.nodeName !== "P")
                        return false;
                    return this.isBlock(element.parentNode);
                };
                /**
                 * Check if the given element represents a span within a block
                 */
                EditDocument.isSpan = function (element) {
                    // TODO not all spans are spans within a block
                    return element.nodeName === "SPAN";
                };
                /**
                 * Split the block pointed at by cursor into two blocks.  The content before the cursor
                 * will be its own block and the content after the cursor will be its own block.
                 *
                 * @note The cursor will be updated to point to the end of the block that contains the
                 * content before the cursor.
                 * @param {DocumentCursor} cursor The cursor whose position determines the split point.
                 */
                EditDocument.splitBlock = function (cursor) {
                    var newBlock = Internal.BlockItem.createNewBlock();
                    // simple: add a blank paragraph before
                    if (cursor.isBeginningOfBlock) {
                        // We're at the beginning of the block, so let's make this simple and just add a
                        // blank paragraph before the current block.
                        EditDocument.insertBlockBefore(cursor.block, newBlock);
                        // don't forget to fix up the cursor to point to the end of the "new content" which is
                        // just the blank paragraph
                        cursor.moveToEndOf(newBlock);
                        return;
                    }
                    // simple: add a blank paragraph after
                    if (cursor.isEndOfBlock) {
                        EditDocument.insertBlockAfter(cursor.block, newBlock);
                        return;
                    }
                    // complex: need to extract the contents from inside the block
                    var range = document.createRange();
                    // If we're at the end of a span, its better to start the selection by selecting the
                    // entirety of the next span, otherwise we'll end up with an empty span, which we do
                    // not allow.  If we're not at the end of a span, it means we're in the middle of one
                    // so just start the selection and the current text node and let the
                    // Range.extractContents() do the magic of extracting the correct hierarchy of
                    // elements.
                    var startSelection = cursor.isEndOfSpan ? cursor.spanElement.nextSibling : cursor.nextNode;
                    range.setStartBefore(startSelection);
                    range.setEndAfter(cursor.block.lastContentSpan);
                    var contentOfNewBlock = range.extractContents();
                    EditDocument.appendToBlock(newBlock, contentOfNewBlock);
                    EditDocument.insertBlockAfter(cursor.block, newBlock);
                    range.detach();
                    // potentially, the text node that we once held in the cursor is no longer in the same
                    // span, so be sure to fix it up before returning
                    if (cursor.textNode != null) {
                        cursor.setTo(cursor.block, cursor.textNode.parentNode, cursor.textNode);
                    }
                };
                /**
                 * Add elements to the position pointed to by cursor, and move the cursor forward so
                 * that it points after the newly inserted content.
                 */
                EditDocument.addElementsToCursorAndAdvance = function (cursor, fragment) {
                    // TODO, remove cursor if possible
                    var clone = cursor.clone();
                    var isAtEnd = !clone.moveForwardInBlock();
                    cursor.add(fragment);
                    if (isAtEnd) {
                        cursor.moveToEndOf(cursor.block);
                    }
                    else {
                        clone.moveBackwards();
                        cursor.cloneFrom(clone);
                    }
                };
                /**
                 * Insert a block following the current block.
                 * @param {BlockItem} currentBlock  The block that becomes the previous sibling to the inserted
                 *                                  block.
                 * @param {BlockItem} newBlock The new block inserted after currentBlock.
                 */
                EditDocument.insertBlockAfter = function (currentBlock, newBlock) {
                    if (currentBlock == null)
                        throw "currentBlock cannot be null";
                    if (newBlock == null)
                        throw "newBlock cannot be null";
                    currentBlock.containerElement.parentElement.insertBefore(newBlock.containerElement, currentBlock.nextContainer);
                };
                /**
                 * Insert a block before the current block.
                 *
                 * @note simple method but implemented for readability
                 */
                EditDocument.insertBlockBefore = function (blockItem, newBlock) {
                    blockItem.containerElement.parentElement.insertBefore(newBlock.containerElement, blockItem.containerElement);
                };
                /**
                 * Inserts text at the cursor location.
                 * @param {DocumentCursor} cursor The location at which the text should be inserted.
                 * @param {string} text The text that should be inserted into the document.
                 * @return a cursor representing the end of the content.
                 *
                 * @remarks Blocks will automatically be created if newlines are contained within
                 *                 the text.  if this is not desired, remove newlines from the given text.
                 */
                EditDocument.insertText = function (cursor, text) {
                    cursor = cursor.clone();
                    var fragment = document.createDocumentFragment();
                    var fragments = [fragment];
                    text.split("").forEach(function (part) {
                        if (part === carriageReturn)
                            return;
                        if (part === newline) {
                            fragment = document.createDocumentFragment();
                            fragments.push(fragment);
                            return;
                        }
                        var span = document.createTextNode(part);
                        fragment.appendChild(span);
                    });
                    // insert the current text
                    EditDocument.addElementsToCursorAndAdvance(cursor, fragments[0]);
                    for (var i = 1; i < fragments.length; i++) {
                        EditDocument.splitBlock(cursor);
                        cursor.moveForward();
                        EditDocument.addElementsToCursorAndAdvance(cursor, fragments[i]);
                    }
                    return cursor;
                };
                /**
                 * Merge the contents of two blocks.
                 * @param {BlockItem} mergeInto The block to merge the blockToMerge into.
                 * @param {BlockItem} blockToMerge The block to merge into mergeInto.
                 * @return A DocumentCursor pointing to what used to be the beginning of mergeInto block.
                 */
                EditDocument.mergeBlocks = function (mergeInto, blockToMerge) {
                    if (blockToMerge.isEmpty) {
                        // we're merging in an empty block, so just remove the block
                        EditDocument.removeBlock(blockToMerge);
                        return mergeInto.end;
                    }
                    var wasMergeIntoBlockEmpty = mergeInto.isEmpty;
                    var oldContent = EditDocument.removeBlock(blockToMerge);
                    if (wasMergeIntoBlockEmpty) {
                        EditDocument.appendToBlock(mergeInto, oldContent);
                        return mergeInto.beginning;
                    }
                    var newCursor = mergeInto.end;
                    newCursor.moveBackwardInBlock();
                    EditDocument.appendToBlock(mergeInto, oldContent);
                    newCursor.moveForward();
                    return newCursor;
                };
                /**
                 * Add the given fragment to the end of the given block
                 * @param block the block to which to append content
                 * @param fragment the fragment to append
                 */
                EditDocument.appendToBlock = function (block, fragment) {
                    var lastContent = block.lastContentSpan;
                    // we CANNOT allow empty spans, so remove the existing empty span if it exists
                    if (block.isEmpty) {
                        block.contentElement.removeChild(block.firstContentSpan);
                    }
                    block.contentElement.insertBefore(fragment, block.contentElement.lastElementChild);
                    var nextSpan = lastContent.nextElementSibling;
                    // Note don't worry if we removed this element, that just means nextElementSibiling
                    // will be null.
                    if (nextSpan != null && lastContent.className === nextSpan.className) {
                        // the spans have the same "style" so combine them
                        lastContent.appendChild(HtmlUtils.convertToFragment(nextSpan));
                        // the element is now empty so we remove it
                        nextSpan.parentElement.removeChild(nextSpan);
                    }
                };
                /**
                 * Removes the block from the document, returning the content (without indicators) of
                 * the block.
                 */
                EditDocument.removeBlock = function (blockToRemove) {
                    var fragment = HtmlUtils.convertToFragment(blockToRemove.contentElement);
                    fragment.removeChild(fragment.firstChild);
                    fragment.removeChild(fragment.lastChild);
                    HtmlUtils.removeElement(blockToRemove.containerElement);
                    return fragment;
                };
                EditDocument.blockFromSpan = function (element) {
                    return new Internal.BlockItem(element.parentNode.parentNode);
                };
                return EditDocument;
            })();
            Internal.EditDocument = EditDocument;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=EditDocument.js.map