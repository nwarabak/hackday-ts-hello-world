import * as Lint from 'tslint';
import * as TS from 'typescript';
import * as _string from 'underscore.string';

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: TS.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new QueueableClassWalker(sourceFile, this.getOptions()));
    }
}

class QueueableClassWalker extends Lint.RuleWalker {
    protected visitClassDeclaration(node: TS.ClassDeclaration): void {
        if (node.name && _string.startsWith(node.name.getText(), 'Queueable')) {
            const handlePropertyData: { name: string, node: TS.PropertyDeclaration }[] = [];
            const queuePropertyData: { name: string, initialize_statement: string, node: TS.PropertyDeclaration }[] = [];

            for (const member of node.members) {
                if (TS.isPropertyDeclaration(member)) {
                    if (_string.startsWith(member.name.getText(), 'handle')) {
                        handlePropertyData.push({ name: member.name.getText(), node: member });
                    } else if (_string.startsWith(member.name.getText(), 'queue')) {
                        if (member.initializer) {
                            queuePropertyData.push({ name: member.name.getText(), initialize_statement: member.initializer.getText(), node: member });
                        }
                    }
                }
            }

            // handle property checks
            for (const handleProperty of handlePropertyData) {
                let correspondingQueuePropertyFound = false;
                for (const queueProperty of queuePropertyData) {
                    if (_string.contains(queueProperty.initialize_statement, handleProperty.name)) {
                        correspondingQueuePropertyFound = true;
                        break;
                    }
                }

                if (!correspondingQueuePropertyFound) {
                    this.addFailureAtNode(handleProperty.node.name, `The handle property ${handleProperty.name} does not have a corresponding property that starts with 'queue'`);
                }
            }

            // queue property checks
            for (const queueProperty of queuePropertyData) {

                let correspondingHandleMethodFound = false;
                for (const handleProperty of handlePropertyData) {
                    if (_string.contains(queueProperty.initialize_statement, handleProperty.name)) {
                        correspondingHandleMethodFound = true;
                    }
                }
                if (!correspondingHandleMethodFound) {
                    this.addFailureAtNode(queueProperty.node.name, `The queue property ${queueProperty.name} was not made using a corresponding property that starts with 'handle'`);
                }

                if (!_string.contains(queueProperty.initialize_statement, 'registerQueueAction(') && queueProperty.node.initializer) {
                    this.addFailureAtNode(queueProperty.node.initializer, 'The queue properties must be declared using the registerQueueAction method');
                }
            }
        }

        super.visitClassDeclaration(node);
    }
}
