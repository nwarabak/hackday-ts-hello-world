import * as Lint from 'tslint';
import * as TS from 'typescript';
import * as _string from 'underscore.string';

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: TS.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new BanImportsWalker(sourceFile, this.getOptions()));
    }
}

class BanImportsWalker extends Lint.RuleWalker {
    public visitImportDeclaration(node: TS.ImportDeclaration): void {
        const moduleName = (node.moduleSpecifier as TS.StringLiteral).text;

        for (const banned of this.getOptions()) {
            const bannedName = banned['moduleName'];

            if (_string.contains(bannedName, '*')) {
                // If you have a * operator in your banned modules, you want to make sure that you are not importing from
                // any location that could fit that star
                const bannedImportRoot = bannedName.split('*')[0];
                const moduleNameParts = moduleName.split(bannedImportRoot);
                if (moduleNameParts.length > 1 && moduleNameParts[1].length > 0) {
                    this.addFailure(this.createFailure(node.moduleSpecifier.getStart(),
                        node.moduleSpecifier.getFullWidth(),
                        `importing ${moduleName} has been explicitly banned, ${banned.rationale}`));
                }
            } else {
                // if no star is provided just check for the exact path
                if (moduleName === bannedName) {
                    this.addFailure(this.createFailure(node.moduleSpecifier.getStart(),
                        node.moduleSpecifier.getFullWidth(),
                        `importing ${moduleName} has been explicitly banned, ${banned.rationale}`));
                }
            }
        }

        super.visitImportDeclaration(node);
    }
}
