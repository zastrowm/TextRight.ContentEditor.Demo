var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            /**
             * Caches lookup data for various parts of the document
             */
            var DocumentCache = (function () {
                /**
                 * Create a new cache for the given element
                 */
                function DocumentCache(documentModel) {
                    this.documentModel = documentModel;
                    this.indexTokenProvider = new Internal.SnapshotTokenProvider();
                }
                /**
                 * Mark all block indicies before the given block as invalid.
                 */
                DocumentCache.prototype.invalidateIndicesBefore = function (block) {
                    // mark the block before this one as the last good block
                    if (block.isBeginningOfDocument) {
                        this.lastBlockElementIndexed = null;
                    }
                    else {
                        this.lastBlockElementIndexed = block.previousContainer;
                    }
                    this.indexTokenProvider.increment();
                };
                /**
                 * Get the index of the specified block within the document
                 */
                DocumentCache.prototype.getIndexOf = function (block) {
                    var container = block.containerElement;
                    var blockCache = this.getBlockCacheFor(container);
                    // if the index is valid, then we can directly return that
                    if (this.indexTokenProvider.isValid(blockCache.blockIndexToken)) {
                        return blockCache.blockIndex;
                    }
                    // otherwise we need to re-index 
                    var currentElement = null;
                    var currentIndex = 0;
                    // An optimization that we make is to only calculate the indicies that we need to calculate.
                    // If we insert a new paragraph before paragraph 5, we don't need to re-calculate the index
                    // for paragraphs 6-N; instead, we re-index from 0 to 5, then save 5 as the starting point
                    // for when we need to calculate 6 and beyond
                    if (this.lastBlockElementIndexed != null) {
                        var lastCache = this.getBlockCacheFor(this.lastBlockElementIndexed);
                        if (this.indexTokenProvider.isValid(lastCache.blockIndexToken)) {
                            currentElement = this.lastBlockElementIndexed;
                            currentIndex = lastCache.blockIndex;
                        }
                    }
                    // start at the beginning of the last indexed element was not valid or non-existent
                    if (currentElement == null) {
                        currentElement = this.documentModel.firstBlock.containerElement;
                        currentIndex = 0;
                    }
                    var currentCache = this.getBlockCacheFor(currentElement);
                    while (currentElement !== null && currentElement !== container) {
                        currentCache = this.getBlockCacheFor(currentElement);
                        currentCache.blockIndex = currentIndex;
                        currentCache.blockIndexToken = this.indexTokenProvider.token;
                        currentIndex++;
                        currentElement = currentElement.nextElementSibling;
                    }
                    if (currentElement == null) {
                        console.error("Element was never reached during re-index");
                        return -1;
                    }
                    //else if (currentElement === container) 
                    currentCache.blockIndex = currentIndex;
                    currentCache.blockIndexToken = this.indexTokenProvider.token;
                    this.lastBlockElementIndexed = currentElement;
                    // we always re-index right up to the value
                    return currentIndex;
                };
                /**
                 * Get the block cache that is attached to the given container, creating a new cached
                 *   data block and attaching it if the block does not already exist.
                 */
                DocumentCache.prototype.getBlockCacheFor = function (blockContainer) {
                    var cache = blockContainer._cache;
                    if (cache == null) {
                        cache = new BlockCache();
                        blockContainer._cache = cache;
                    }
                    return cache;
                };
                return DocumentCache;
            })();
            Internal.DocumentCache = DocumentCache;
            /**
             * Contains cached data for a block
             */
            var BlockCache = (function () {
                function BlockCache() {
                }
                return BlockCache;
            })();
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=DocumentCache.js.map