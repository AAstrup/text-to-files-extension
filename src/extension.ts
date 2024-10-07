import * as vscode from "vscode";
import { copyTypeScriptContent } from "./extensionToClipboard";
import { generateFiles } from "./extensionGenerateFiles";
import { extractToFunctionalComponent } from "./extensionExtract";
import { copyFileContent } from "./extensionCopySelectedFilesContent";

export function activate(context: vscode.ExtensionContext) {
    // Register the 'extension.generateFiles' command
    let disposableGenerateFiles = vscode.commands.registerCommand(
        "extension.generateFiles",
        generateFiles()
    );

    // Register the 'extension.copyTypeScriptContent' command
    let disposableCopyContent = vscode.commands.registerCommand(
        "extension.copyTypeScriptContent",
        async () => {
            await copyTypeScriptContent();
        }
    );

    let disposableExtractComponent = vscode.commands.registerCommand(
        "extension.extractToFunctionalComponent",
        async () => {
            await extractToFunctionalComponent();
        }
    );

    let disposable = vscode.commands.registerCommand(
        'extension.copyFileContent',
        async (firstUri: vscode.Uri, selectedUris: vscode.Uri[]) => {
          await copyFileContent(firstUri, selectedUris);
        }
      );
      

    // Add both disposables to the subscriptions
    context.subscriptions.push(disposableGenerateFiles);
    context.subscriptions.push(disposableCopyContent);
    context.subscriptions.push(disposableExtractComponent);
    context.subscriptions.push(disposable);
}


export function deactivate() {}
