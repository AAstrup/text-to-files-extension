import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        "extension.generateFiles",
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage("No active editor detected.");
                return;
            }

            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            if (!selectedText) {
                vscode.window.showErrorMessage("No text selected.");
                return;
            }

            // Parse the selected text and create files
            try {
                const createdFiles = await parseAndCreateFiles(selectedText);

                if (createdFiles.length === 0) {
                    vscode.window.showInformationMessage(
                        "No files were generated."
                    );
                } else {
                    const fileList = createdFiles.join("\n");
                    vscode.window.showInformationMessage(
                        `Files generated successfully:\n${fileList}`
                    );

                    // Optionally, you can also open the generated files automatically
                    for (const filePath of createdFiles) {
                        const document =
                            await vscode.workspace.openTextDocument(filePath);
                        await vscode.window.showTextDocument(document, {
                            preview: false,
                        });
                    }
                }
            } catch (error: any) {
                vscode.window.showErrorMessage(
                    `Error generating files: ${error.message}`
                );
            }
        }
    );

    context.subscriptions.push(disposable);
}

async function parseAndCreateFiles(text: string): Promise<string[]> {
    // Regular expression to match filenames and code blocks
    const regex = /### \*\*Filename: `(.+?)`\*\*\s+```[a-z]*\s*([\s\S]+?)```/g;
    let match;
    const createdFiles: string[] = [];

    while ((match = regex.exec(text)) !== null) {
        const filename = match[1].trim();
        let content = match[2].trim();

        // Remove any comment lines that duplicate the filename inside the code block
        content = removeDuplicateFilenameComments(content, filename);

        // Get the workspace root path
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error("No workspace is opened.");
        }
        const rootPath = workspaceFolders[0].uri.fsPath;

        // Construct the full file path
        const filePath = path.join(rootPath, filename);

        // Ensure the directory exists
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

        // Write the content to the file
        await fs.promises.writeFile(filePath, content, "utf8");

        // Add the file path to the list of created files
        createdFiles.push(filePath);
    }

    return createdFiles;
}

function removeDuplicateFilenameComments(
    content: string,
    filename: string
): string {
    const lines = content.split(/\r?\n/);
    return lines.filter((line) => !line.includes(filename)).join("\n");
}

export function deactivate() {}
