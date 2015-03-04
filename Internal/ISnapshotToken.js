var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            // ~ Int32.MaxValue
            var maxIntBeforeRollover = 21474836400;
            /**
             * Provides ISnapshotToken and creates unique tokens to give out to providers
             */
            var SnapshotTokenProvider = (function () {
                function SnapshotTokenProvider() {
                    this.token = 1;
                }
                /**
                 * Move to the next cache index
                 */
                SnapshotTokenProvider.prototype.increment = function () {
                    this.token++;
                    if (this.token > maxIntBeforeRollover) {
                        this.token = 1;
                    }
                };
                /**
                 * Check if a given token is current
                 */
                SnapshotTokenProvider.prototype.isValid = function (token) {
                    return this.token == token;
                };
                return SnapshotTokenProvider;
            })();
            Internal.SnapshotTokenProvider = SnapshotTokenProvider;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=ISnapshotToken.js.map