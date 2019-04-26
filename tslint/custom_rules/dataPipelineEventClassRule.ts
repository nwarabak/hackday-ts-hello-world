import * as _ from 'lodash';
import * as Lint from 'tslint';
import * as TS from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: TS.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new DataPipelineEventClassWalker(sourceFile, this.getOptions()));
    }
}

class DataPipelineEventClassWalker extends Lint.RuleWalker {
    protected getExtendedClassName(heritageClauses: TS.NodeArray<TS.HeritageClause> | undefined): string | undefined {
        if (heritageClauses === undefined) {
            return;
        }
        for (const clause of heritageClauses) {
            if (clause.token === TS.SyntaxKind.ExtendsKeyword) {
                return clause.types[0].expression.getText();
            }
        }
    }

    protected lintTopicName(topicNameProperty: TS.PropertyDeclaration, extendedClassName: string): void {
        // ensure initializer
        if (!topicNameProperty.initializer) {
            this.addFailureAtNode(topicNameProperty.name, `The topicName of a ${extendedClassName} subclass must be initialized in the property declaration`);
            return;
        }

        // ensure that initalizer is a string literal
        if (!TS.isStringLiteral(topicNameProperty.initializer)) {
            this.addFailureAtNode(topicNameProperty.initializer, `The topicName of a ${extendedClassName} subclass must be initialized to a string literal`);
            return;
        }

        // ensure that string starts with 'tm_'
        const unquotedTopicName = _.trim(topicNameProperty.initializer.getText(), '\'"');
        if (!_.startsWith(unquotedTopicName, 'tm_')) {
            this.addFailureAtNode(topicNameProperty.initializer, `The topicName of a ${extendedClassName} subclass must start with tm_`);
        }
    }

    protected visitClassDeclaration(node: TS.ClassDeclaration): void {
        super.visitClassDeclaration(node);

        const extendedClassName = this.getExtendedClassName(node.heritageClauses);
        if (extendedClassName === undefined || !_.includes(['DataPipelineDatabaseEvent', 'DataPipelineBusinessEvent'], extendedClassName)) {
            return;
        }
        // now we know we're working with a direct subclass of DataPipelineDatabaseEvent or DataPipelineBusinessEvent

        // find the topicName property
        for (const member of node.members) {
            if (TS.isPropertyDeclaration(member)) {
                if (member.name.getText() === 'topicName') {
                    this.lintTopicName(member, extendedClassName);
                }
            }
        }
    }

}
