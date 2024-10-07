import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export async function extractToFunctionalComponent() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor detected.");
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const selectedText = document.getText(selection);

    if (!selectedText) {
        vscode.window.showErrorMessage("No JSX code selected.");
        return;
    }

    // Ensure the selected text contains JSX
    if (!selectedText.includes("<")) {
        vscode.window.showErrorMessage("Selected text does not contain JSX.");
        return;
    }

    // Ask the user for the component name
    const componentName = await vscode.window.showInputBox({
        prompt: "Enter the name for the new component",
        validateInput: (value) => {
            if (!value || !/^[A-Z][A-Za-z0-9]*$/.test(value)) {
                return "Component name must start with an uppercase letter and contain only alphanumeric characters.";
            }
            return null;
        },
    });

    if (!componentName) {
        vscode.window.showErrorMessage("Component name is required.");
        return;
    }

    // Parse the selected code to find props and imports
    const props = await getComponentProps(selectedText);
    const imports = await getRequiredImports(document, selectedText);

    // Generate the component code
    const componentCode = generateComponentCode(componentName, selectedText, props, imports);

    // Create the new component file
    const createdFilePath = await createComponentFile(document.uri, componentName, componentCode);

    if (!createdFilePath) {
        vscode.window.showErrorMessage("Failed to create component file.");
        return;
    }

    // Replace the selected text with the component usage
    await editor.edit((editBuilder) => {
        const propsString = props.length > 0 ? ` ${props.join(" ")}` : "";
        editBuilder.replace(selection, `<${componentName}${propsString} />`);
    });

    // Import the new component in the original file
    const importStatement = `import ${componentName} from './${componentName}';\n`;
    await insertImportStatement(document, importStatement);

    vscode.window.showInformationMessage(`Component '${componentName}' extracted successfully.`);
}

async function getComponentProps(selectedText: string): Promise<string[]> {
    // Simple regex to find {props.someProp} or props.someProp usage
    const propRegex = /props\.([a-zA-Z0-9_]+)/g;
    const matches = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = propRegex.exec(selectedText)) !== null) {
        matches.add(match[1]);
    }

    // Find attributes used directly in JSX tags
    const attrRegex = /<[\w]+[^>]*\s([a-zA-Z0-9_]+)=/g;
    while ((match = attrRegex.exec(selectedText)) !== null) {
        matches.add(match[1]);
    }

    return Array.from(matches);
}

async function getRequiredImports(document: vscode.TextDocument, selectedText: string): Promise<string[]> {
    // Simple approach: extract import statements from the document that are used in selectedText
    const importRegex = /import\s+[^;]+;/g;
    const imports: string[] = [];
    const documentText = document.getText();
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(documentText)) !== null) {
        const importStatement = match[0];
        const importNamesRegex = /import\s+(?:\*\s+as\s+)?(?:{[^}]+}|[\w]+)\s+from\s+['"][^'"]+['"]/;
        const importNamesMatch = importNamesRegex.exec(importStatement);
        if (importNamesMatch && selectedText.includes(importNamesMatch[0])) {
            imports.push(importStatement);
        }
    }

    return imports;
}
function generateComponentCode(
    componentName: string,
    selectedJSX: string,
    props: string[],
    imports: string[]
): string {
    const propsInterface = props.length > 0
        ? `interface ${componentName}Props {\n${props.map((prop) => `  ${prop}: any;`).join('\n')}\n}\n\n`
        : '';

    const importStatements = imports.join('\n');

    const component = `${importStatements}

${propsInterface}const ${componentName}: React.FC${props.length > 0 ? `<${componentName}Props>` : ''} = (${props.length > 0 ? 'props' : ''}) => {
    return (
        ${selectedJSX}
    );
};

export default ${componentName};
`;

    return component;
}
async function createComponentFile(
    originalFileUri: vscode.Uri,
    componentName: string,
    componentCode: string
): Promise<string | null> {
    const originalDir = path.dirname(originalFileUri.fsPath);
    const componentFileName = `${componentName}.tsx`;
    const componentFilePath = path.join(originalDir, componentFileName);

    try {
        await fs.promises.writeFile(componentFilePath, componentCode, 'utf8');
        return componentFilePath;
    } catch (error) {
        console.error('Failed to create component file:', error);
        return null;
    }
}
async function insertImportStatement(
    document: vscode.TextDocument,
    importStatement: string
): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    const firstImportPosition = findFirstImportPosition(document);
    edit.insert(document.uri, firstImportPosition, importStatement);
    await vscode.workspace.applyEdit(edit);
}

function findFirstImportPosition(document: vscode.TextDocument): vscode.Position {
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        if (!line.text.startsWith('import ')) {
            return new vscode.Position(i, 0);
        }
    }
    return new vscode.Position(0, 0);
}
