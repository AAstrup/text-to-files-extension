import * as vscode from "vscode";
import { copyTypeScriptContent } from "./extensionToClipboard";
import { generateFiles } from "./extensionGenerateFiles";

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

    // Add both disposables to the subscriptions
    context.subscriptions.push(disposableGenerateFiles);
    context.subscriptions.push(disposableCopyContent);
}


export function deactivate() {}
