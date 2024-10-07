import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export async function copyTypeScriptContent() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found.');
    return;
  }

  const document = editor.document;
  if (document.languageId !== 'typescript' && document.languageId !== 'typescriptreact') {
    vscode.window.showErrorMessage('Please open a TypeScript file.');
    return;
  }

  const maxLineLength = vscode.workspace.getConfiguration('typescriptContentCopier').get<number>('maxLineLength') || 200;

  const currentFilePath = document.fileName;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('Please open a file within a workspace.');
    return;
  }

  const rootDir = workspaceFolder.uri.fsPath;

  // Read current file content with line limit
  const currentFileContent = readFileWithLineLimit(currentFilePath, maxLineLength);

  // Parse imports
  const importedFiles = parseImports(currentFileContent, path.dirname(currentFilePath));

  // Collect contents of imported files
  const importedFilesContent = collectImportedFilesContent(importedFiles, rootDir, maxLineLength);

  // Format output
  const output = formatOutput(currentFilePath, currentFileContent, importedFilesContent, rootDir);

  // Copy to clipboard
  await vscode.env.clipboard.writeText(output);

  vscode.window.showInformationMessage('TypeScript content copied to clipboard.');
}

function readFileWithLineLimit(filePath: string, maxLines: number): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n');
    }
    return content;
  } catch (err) {
    return '';
  }
}

function parseImports(fileContent: string, baseDir: string): string[] {
  const importRegex = /import\s+(?:.+?\s+from\s+)?['"](.+?)['"];?/g;
  const importedFiles: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(fileContent)) !== null) {
    let importPath = match[1];
    if (importPath.startsWith('.')) {
      // Resolve relative paths
      const resolvedPath = path.resolve(baseDir, importPath);
      importedFiles.push(resolvedPath);
    }
    // Skip node_modules imports
  }

  return importedFiles;
}

function collectImportedFilesContent(importedFiles: string[], rootDir: string, maxLines: number): { [key: string]: string } {
  const importedFilesContent: { [key: string]: string } = {};

  importedFiles.forEach(filePath => {
    let tsFilePath = filePath;
    if (!tsFilePath.endsWith('.ts') && !tsFilePath.endsWith('.tsx')) {
      if (fs.existsSync(tsFilePath + '.ts')) {
        tsFilePath += '.ts';
      } else if (fs.existsSync(tsFilePath + '.tsx')) {
        tsFilePath += '.tsx';
      } else {
        return;
      }
    }

    if (fs.existsSync(tsFilePath)) {
      const content = readFileWithLineLimit(tsFilePath, maxLines);
      const relativePath = path.relative(rootDir, tsFilePath);
      importedFilesContent[relativePath] = content;
    }
  });

  return importedFilesContent;
}

function formatOutput(
  currentFilePath: string,
  currentFileContent: string,
  importedFilesContent: { [key: string]: string },
  rootDir: string
): string {
  const relativeCurrentFilePath = path.relative(rootDir, currentFilePath);

  let output = `Help me refactor this file,\n${relativeCurrentFilePath} with the following code "${currentFileContent}".\nFor context here are the referenced/imported files:\n`;

  for (const [filePath, content] of Object.entries(importedFilesContent)) {
    output += `- ${filePath} with code "${content}"\n`;
  }

  return output;
}
