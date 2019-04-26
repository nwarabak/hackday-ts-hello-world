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
var _ = require("lodash");
var TS = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new DataPipelineEventClassWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var DataPipelineEventClassWalker = (function (_super) {
    __extends(DataPipelineEventClassWalker, _super);
    function DataPipelineEventClassWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPipelineEventClassWalker.prototype.getExtendedClassName = function (heritageClauses) {
        if (heritageClauses === undefined) {
            return;
        }
        for (var _i = 0, heritageClauses_1 = heritageClauses; _i < heritageClauses_1.length; _i++) {
            var clause = heritageClauses_1[_i];
            if (clause.token === TS.SyntaxKind.ExtendsKeyword) {
                return clause.types[0].expression.getText();
            }
        }
    };
    DataPipelineEventClassWalker.prototype.lintTopicName = function (topicNameProperty, extendedClassName) {
        // ensure initializer
        if (!topicNameProperty.initializer) {
            this.addFailureAtNode(topicNameProperty.name, "The topicName of a " + extendedClassName + " subclass must be initialized in the property declaration");
            return;
        }
        // ensure that initalizer is a string literal
        if (!TS.isStringLiteral(topicNameProperty.initializer)) {
            this.addFailureAtNode(topicNameProperty.initializer, "The topicName of a " + extendedClassName + " subclass must be initialized to a string literal");
            return;
        }
        // ensure that string starts with 'tm_'
        var unquotedTopicName = _.trim(topicNameProperty.initializer.getText(), '\'"');
        if (!_.startsWith(unquotedTopicName, 'tm_')) {
            this.addFailureAtNode(topicNameProperty.initializer, "The topicName of a " + extendedClassName + " subclass must start with tm_");
        }
    };
    DataPipelineEventClassWalker.prototype.visitClassDeclaration = function (node) {
        _super.prototype.visitClassDeclaration.call(this, node);
        var extendedClassName = this.getExtendedClassName(node.heritageClauses);
        if (extendedClassName === undefined || !_.includes(['DataPipelineDatabaseEvent', 'DataPipelineBusinessEvent'], extendedClassName)) {
            return;
        }
        // now we know we're working with a direct subclass of DataPipelineDatabaseEvent or DataPipelineBusinessEvent
        // find the topicName property
        for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
            var member = _a[_i];
            if (TS.isPropertyDeclaration(member)) {
                if (member.name.getText() === 'topicName') {
                    this.lintTopicName(member, extendedClassName);
                }
            }
        }
    };
    return DataPipelineEventClassWalker;
}(Lint.RuleWalker));
