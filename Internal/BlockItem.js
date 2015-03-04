var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            /**
             * Contains a block/paragraph item
             */
            var BlockItem = (function () {
                /**
                 * Wrap a block element for the document
                 */
                function BlockItem(containerElement) {
                    this.containerElement = containerElement;
                }
                /**
                 * Check if the given element represents a block
                 */
                BlockItem.isBlock = function (element) {
                    return element.nodeName === "BLOCK";
                };
                /**
                 * Check if the given element represents the content of a block (aka the
                 * paragraph in the block)
                 */
                BlockItem.isBlockContent = function (element) {
                    if (element.nodeName !== "P")
                        return false;
                    return this.isBlock(element.parentNode);
                };
                /**
                 * Check if the given element represents a span within a block
                 */
                BlockItem.isSpan = function (element) {
                    // TODO not all spans are spans within a block
                    return element.nodeName === "SPAN";
                };
                /**
                 * Get a block item that represents the block that the given span is contained within
                 */
                BlockItem.blockFromSpan = function (element) {
                    // TODO more error checking
                    return new BlockItem(element.parentNode.parentNode);
                };
                /**
                 * Create a new block that can be inserted into he document
                 */
                BlockItem.createNewBlock = function () {
                    var newContainer = document.createElement("block");
                    var newParagaph = document.createElement("p");
                    newContainer.appendChild(newParagaph);
                    var firstChild = document.createElement("span");
                    firstChild.classList.add(Internal.ElementClasses.firstChildElement);
                    firstChild.innerHTML = "&#8203;";
                    var lastChild = document.createElement("span");
                    lastChild.classList.add(Internal.ElementClasses.lastChildElement);
                    firstChild.innerHTML = "&#8203;";
                    var firstSpan = document.createElement("span");
                    newParagaph.appendChild(firstChild);
                    newParagaph.appendChild(firstSpan);
                    newParagaph.appendChild(lastChild);
                    return new BlockItem(newContainer);
                };
                Object.defineProperty(BlockItem.prototype, "contentElement", {
                    /**
                     * The paragraph element associated with this block
                     */
                    get: function () {
                        return this.containerElement.firstChild;
                        ;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "isEmpty", {
                    /** Returns true if the block has no content. */
                    get: function () {
                        // get the first span and check if it has children
                        return !this.firstContentSpan.hasChildNodes();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "isBeginningOfDocument", {
                    /** Returns true if the block is the first block in the document. */
                    get: function () {
                        return this.previousContainer.classList.contains(Internal.ElementClasses.firstBlock);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "isEndOfDocument", {
                    /** Returns true if the block is the last block in the document. */
                    get: function () {
                        return this.nextContainer.classList.contains(Internal.ElementClasses.lastBlock);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "nextContainer", {
                    /* Gets the next container element to this block*/
                    get: function () {
                        return this.containerElement.nextElementSibling;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "previousContainer", {
                    /* Gets the previous container element to this block*/
                    get: function () {
                        return this.containerElement.previousElementSibling;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "nextBlock", {
                    get: function () {
                        // TODO handle parent/children blocks
                        return new BlockItem(this.nextContainer);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "previousBlock", {
                    get: function () {
                        // TODO handle parent/children blocks
                        return new BlockItem(this.previousContainer);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "firstContentSpan", {
                    /**
                     * Get the first span that represents content of this block
                     */
                    get: function () {
                        return this.contentElement.firstElementChild.nextElementSibling;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "lastContentSpan", {
                    /**
                     * Get the last span that represents content of this block
                     */
                    get: function () {
                        return this.contentElement.lastElementChild.previousElementSibling;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "end", {
                    /**
                    * Retrieves a document cursor which represents the end of this block.
                    * @return A DocumentCursor representing the end of this block.
                    */
                    get: function () {
                        var cursor = new Internal.DocumentCursor(null, null, null);
                        cursor.moveToEndOf(this);
                        return cursor;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(BlockItem.prototype, "beginning", {
                    /**
                     * Retrieves a document cursor which represents the beginning of this block.
                     * @return A DocumentCursor representing the beginning of this block.
                     */
                    get: function () {
                        var cursor = new Internal.DocumentCursor(null, null, null);
                        cursor.moveToBeginningOf(this);
                        return cursor;
                    },
                    enumerable: true,
                    configurable: true
                });
                return BlockItem;
            })();
            Internal.BlockItem = BlockItem;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=BlockItem.js.map