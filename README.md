# Text to Files Extension

## **Overview**

**Text to Files Extension** is a Visual Studio Code extension that allows you to extract and generate multiple files and directories directly from selected text in your editor. This tool streamlines the process of setting up project structures or reconstituting shared code snippets into actual files, saving you time and effort.

## **Features**

-   **Parse Structured Text:** Automatically detects filenames and code blocks within selected text.
-   **Create Files and Directories:** Generates files with the specified paths and contents.

## **Usage**

1.  **Prepare Your Text:**

        Structure your text in the following format to define the files you want to generate:

        ````markdown
        ### **Filename: `path/to/file.ext`**

        ```language
        // Optional comment line

    **Example:**

``````markdown
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
``````

```

```
