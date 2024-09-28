# Text to Files Extension

![Extension Banner](assets/banner.png)

## **Overview**

**Text to Files Extension** is a Visual Studio Code extension that allows you to extract and generate multiple files and directories directly from selected text in your editor. This tool streamlines the process of setting up project structures or reconstituting shared code snippets into actual files, saving you time and effort.

## **Features**

-   **Parse Structured Text:** Automatically detects filenames and code blocks within selected text.
-   **Create Files and Directories:** Generates files with the specified paths and contents.
-   **User-Friendly Commands:** Easily accessible via Command Palette and context menu.
-   **Customizable:** Modify regex patterns or extend functionality as needed.
-   **Open Generated Files:** Optionally open the generated files automatically in the editor.

## **Installation**

### **Using VS Code Marketplace**

1. Open Visual Studio Code.
2. Go to the **Extensions** view by clicking on the Extensions icon in the Activity Bar or pressing `Ctrl+Shift+X`.
3. Search for **"Text to Files Extension"**.
4. Click **Install**.

### **Using `.vsix` Package**

1. Download the `.vsix` file from the [Releases](https://github.com/your-username/text-to-files-extension/releases) page.
2. Open Visual Studio Code.
3. Go to the **Extensions** view (`Ctrl+Shift+X`).
4. Click on the three-dot menu in the top-right corner and select **Install from VSIX...**.
5. Navigate to the downloaded `.vsix` file and select it.

## **Usage**

1.  **Prepare Your Text:**

        Structure your text in the following format to define the files you want to generate:

        ````markdown
        ### **Filename: `path/to/file.ext`**

        ```language
        // Optional comment line

    **Example:**

`````markdown
### **Filename: `src/App.tsx`**

`````tsx
// src/App.tsx

interface Job {
  id: number;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}
    ```
    ````


2. **Generate Files:**

- **Select the Text:** Highlight the text containing the file definitions.
- **Execute Command:**
  - Press `Ctrl+Alt+G`, **OR**
  - Open the Command Palette (`Ctrl+Shift+P`), type **"Generate Files from Selection"**, and press **Enter**.
- **Result:** The specified files and directories will be created in your workspace.

3. **Optional Features:**

- **Open Generated Files Automatically:** The extension can be configured to open the generated files in the editor upon creation.
`````
`````
