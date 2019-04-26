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
var _string = require("underscore.string");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new QueueableClassWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var QueueableClassWalker = (function (_super) {
    __extends(QueueableClassWalker, _super);
    function QueueableClassWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QueueableClassWalker.prototype.visitClassDeclaration = function (node) {
        if (node.name && _string.startsWith(node.name.getText(), 'Queueable')) {
            var handlePropertyData = [];
            var queuePropertyData = [];
            for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
                var member = _a[_i];
                if (TS.isPropertyDeclaration(member)) {
                    if (_string.startsWith(member.name.getText(), 'handle')) {
                        handlePropertyData.push({ name: member.name.getText(), node: member });
                    }
                    else if (_string.startsWith(member.name.getText(), 'queue')) {
                        if (member.initializer) {
                            queuePropertyData.push({ name: member.name.getText(), initialize_statement: member.initializer.getText(), node: member });
                        }
                    }
                }
            }
            // handle property checks
            for (var _b = 0, handlePropertyData_1 = handlePropertyData; _b < handlePropertyData_1.length; _b++) {
                var handleProperty = handlePropertyData_1[_b];
                var correspondingQueuePropertyFound = false;
                for (var _c = 0, queuePropertyData_1 = queuePropertyData; _c < queuePropertyData_1.length; _c++) {
                    var queueProperty = queuePropertyData_1[_c];
                    if (_string.contains(queueProperty.initialize_statement, handleProperty.name)) {
                        correspondingQueuePropertyFound = true;
                        break;
                    }
                }
                if (!correspondingQueuePropertyFound) {
                    this.addFailureAtNode(handleProperty.node.name, "The handle property " + handleProperty.name + " does not have a corresponding property that starts with 'queue'");
                }
            }
            // queue property checks
            for (var _d = 0, queuePropertyData_2 = queuePropertyData; _d < queuePropertyData_2.length; _d++) {
                var queueProperty = queuePropertyData_2[_d];
                var correspondingHandleMethodFound = false;
                for (var _e = 0, handlePropertyData_2 = handlePropertyData; _e < handlePropertyData_2.length; _e++) {
                    var handleProperty = handlePropertyData_2[_e];
                    if (_string.contains(queueProperty.initialize_statement, handleProperty.name)) {
                        correspondingHandleMethodFound = true;
                    }
                }
                if (!correspondingHandleMethodFound) {
                    this.addFailureAtNode(queueProperty.node.name, "The queue property " + queueProperty.name + " was not made using a corresponding property that starts with 'handle'");
                }
                if (!_string.contains(queueProperty.initialize_statement, 'registerQueueAction(') && queueProperty.node.initializer) {
                    this.addFailureAtNode(queueProperty.node.initializer, 'The queue properties must be declared using the registerQueueAction method');
                }
            }
        }
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    return QueueableClassWalker;
}(Lint.RuleWalker));
