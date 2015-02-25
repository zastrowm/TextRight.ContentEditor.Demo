var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        function main() {
            var output = document.querySelector("#document");
            var view = new Editor.Internal.DocumentView(output);
            var debug = document.querySelector("#debug");
            document.querySelector("body").addEventListener('keydown', function (evt) {
                debug.textContent = evt.keyCode.toString();
            });
            view.focus();
        }
        window.addEventListener('load', main);
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=TextRight.js.map