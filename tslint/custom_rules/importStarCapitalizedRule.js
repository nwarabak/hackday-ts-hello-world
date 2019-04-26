"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var TS = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NamespaceImportWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var importMapping = {
    os: 'OS',
    bcrypt: 'BCrypt',
    zlib: 'ZLib',
    fs: 'FS',
    jwt: 'JWT'
};
// The walker takes care of all the work.
var NamespaceImportWalker = (function (_super) {
    __extends(NamespaceImportWalker, _super);
    function NamespaceImportWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NamespaceImportWalker.prototype.visitImportDeclaration = function (node) {
        if (node.importClause && node.importClause.namedBindings && node.importClause.namedBindings.kind === TS.SyntaxKind.NamespaceImport) {
            for (var _i = 0, _a = node.importClause.namedBindings.getChildren(); _i < _a.length; _i++) {
                var childNode = _a[_i];
                if (childNode['text']) {
                    var text = childNode['text'];
                    if (importMapping[text.toLowerCase()] && text !== importMapping[text.toLowerCase()]) {
                        this.addFailure(this.createFailure(childNode.getStart(), childNode.getWidth(), "import name " + text + " must be " + importMapping[text.toLowerCase()]));
                    }
                    else if (text[0] !== text[0].toUpperCase()) {
                        this.addFailure(this.createFailure(childNode.getStart(), childNode.getWidth(), 'import * statements must generally have UpperCamelCase / PascalCase names'));
                    }
                }
            }
        }
        // call the base version of this visitor to actually parse this node
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    return NamespaceImportWalker;
}(Lint.RuleWalker));
