import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function copyFileContent(
    firstUri: vscode.Uri | undefined,
    selectedUris: vscode.Uri[] | undefined
  ) {
    // Aggregate all URIs
    let uris: vscode.Uri[] = [];
  
    if (selectedUris && selectedUris.length > 0) {
      uris = selectedUris;
    } else if (firstUri) {
      uris = [firstUri];
    } else {
      vscode.window.showErrorMessage('No files or directories selected.');
      return;
    }
  
    let allFiles: string[] = [];
  
    for (const uri of uris) {
      const stats = await fs.promises.stat(uri.fsPath);
      if (stats.isFile()) {
        allFiles.push(uri.fsPath);
      } else if (stats.isDirectory()) {
        const filesInDir = await getAllFilesInDirectory(uri.fsPath);
        allFiles = allFiles.concat(filesInDir);
      } else {
        vscode.window.showErrorMessage(
          `Selected resource ${uri.fsPath} is neither a file nor a directory.`
        );
        return;
      }
    }
  
    // Collect content of all files
    const fileContents = await collectFileContents(allFiles);
  
    // Format the content
    const formattedContent = formatFileContents(fileContents);
  
    // Copy to clipboard
    await vscode.env.clipboard.writeText(formattedContent);
  
    vscode.window.showInformationMessage('File content copied to clipboard.');
  }

async function getAllFilesInDirectory(dir: string): Promise<string[]> {
  let files: string[] = [];

  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getAllFilesInDirectory(fullPath);
      files = files.concat(subFiles);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function collectFileContents(files: string[]): Promise<{ [filePath: string]: string }> {
  const fileContents: { [filePath: string]: string } = {};

  for (const filePath of files) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      fileContents[filePath] = content;
    } catch (error) {
      console.error(`Failed to read file: ${filePath}`, error);
    }
  }

  return fileContents;
}

function formatFileContents(fileContents: { [filePath: string]: string }): string {
  let output = '';

  for (const [filePath, content] of Object.entries(fileContents)) {
    const relativeFilePath = path.relative(vscode.workspace.rootPath || '', filePath);

    const fileExtension = path.extname(filePath).slice(1); // Remove the dot
    const languageId = getLanguageId(fileExtension);

    output += `**Filename: \`${relativeFilePath}\`**\n\n`;
    output += `\`\`\`\`\`${languageId}\n`;
    output += `${content}\n`;
    output += `\`\`\`\n\`\`\`\`\`\n\n`;
  }

  return output;
}

function getLanguageId(extension: string): string {
  const languageMap: { [key: string]: string } = {
    'ts': 'typescript',
    'tsx': 'typescriptreact',
    'js': 'javascript',
    'jsx': 'javascriptreact',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'rb': 'ruby',
    'go': 'go',
    'php': 'php',
    'rs': 'rust',
    // Add more mappings as needed
  };

  return languageMap[extension] || 'plaintext';
}
