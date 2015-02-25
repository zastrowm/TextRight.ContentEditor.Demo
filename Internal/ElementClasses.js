var TextRight;
(function (TextRight) {
    var Editor;
    (function (Editor) {
        var Internal;
        (function (Internal) {
            /** All of the classes for special elements within the editor */
            var ElementClasses = (function () {
                function ElementClasses() {
                }
                ElementClasses.firstBlock = "__tr__-firstBlock";
                ElementClasses.lastBlock = "__tr__-lastBlock";
                ElementClasses.firstChildElement = "__tr__-firstChild";
                ElementClasses.lastChildElement = "__tr__-lastChild";
                ElementClasses.paragraph = "__tr__-paragraph";
                ElementClasses.cursor = "__tr__-cursor";
                ElementClasses.textareaInput = "__tr__-textareaInput";
                ElementClasses.selectionTop = "__tr__-selectionTop";
                ElementClasses.selectionMiddle = "__tr__-selectionMiddle";
                ElementClasses.selectionBottom = "__tr__-selectionBottom";
                return ElementClasses;
            })();
            Internal.ElementClasses = ElementClasses;
        })(Internal = Editor.Internal || (Editor.Internal = {}));
    })(Editor = TextRight.Editor || (TextRight.Editor = {}));
})(TextRight || (TextRight = {}));
//# sourceMappingURL=ElementClasses.js.map