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
var Lint = require("tslint");
var _string = require("underscore.string");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new BanImportsWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var BanImportsWalker = (function (_super) {
    __extends(BanImportsWalker, _super);
    function BanImportsWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BanImportsWalker.prototype.visitImportDeclaration = function (node) {
        var moduleName = node.moduleSpecifier.text;
        for (var _i = 0, _a = this.getOptions(); _i < _a.length; _i++) {
            var banned = _a[_i];
            var bannedName = banned['moduleName'];
            if (_string.contains(bannedName, '*')) {
                // If you have a * operator in your banned modules, you want to make sure that you are not importing from
                // any location that could fit that star
                var bannedImportRoot = bannedName.split('*')[0];
                var moduleNameParts = moduleName.split(bannedImportRoot);
                if (moduleNameParts.length > 1 && moduleNameParts[1].length > 0) {
                    this.addFailure(this.createFailure(node.moduleSpecifier.getStart(), node.moduleSpecifier.getFullWidth(), "importing " + moduleName + " has been explicitly banned, " + banned.rationale));
                }
            }
            else {
                // if no star is provided just check for the exact path
                if (moduleName === bannedName) {
                    this.addFailure(this.createFailure(node.moduleSpecifier.getStart(), node.moduleSpecifier.getFullWidth(), "importing " + moduleName + " has been explicitly banned, " + banned.rationale));
                }
            }
        }
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    return BanImportsWalker;
}(Lint.RuleWalker));
