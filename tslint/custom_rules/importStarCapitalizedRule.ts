import * as Lint from 'tslint';
import * as TS from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: TS.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NamespaceImportWalker(sourceFile, this.getOptions()));
    }
}

const importMapping: { [key: string]: string } = {
    os: 'OS',
    bcrypt: 'BCrypt',
    zlib: 'ZLib',
    fs: 'FS',
    jwt: 'JWT',
};

// The walker takes care of all the work.
class NamespaceImportWalker extends Lint.RuleWalker {
    public visitImportDeclaration(node: TS.ImportDeclaration): void {
        if (node.importClause && node.importClause.namedBindings && node.importClause.namedBindings.kind === TS.SyntaxKind.NamespaceImport) {
            for (const childNode of node.importClause.namedBindings.getChildren()) {
                if (childNode['text']) {
                    const text = childNode['text'];
                    if (importMapping[text.toLowerCase()] && text !== importMapping[text.toLowerCase()]) {
                        this.addFailure(this.createFailure(childNode.getStart(), childNode.getWidth(), `import name ${text} must be ${importMapping[text.toLowerCase()]}`));
                    } else if (text[0] !== text[0].toUpperCase()) {
                        this.addFailure(this.createFailure(childNode.getStart(), childNode.getWidth(), 'import * statements must generally have UpperCamelCase / PascalCase names'));
                    }
                }
            }
        }

        // call the base version of this visitor to actually parse this node
        super.visitImportDeclaration(node);
    }
}
