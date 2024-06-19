// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */



  async function openAdjacentFile(next = true) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        vscode.window.showWarningMessage('No active editor detected.');
        return;
    }

    const currentFilePath = activeEditor.document.fileName;
    const currentFolder = path.dirname(currentFilePath);

    fs.readdir(currentFolder, (err, files) => {
        if (err) {
            vscode.window.showErrorMessage(`Failed to read directory: ${err}`);
            return;
        }

        // Filter files (exclude directories) and sort them lexicographically
        const siblingFiles = files.filter(file => !fs.statSync(path.join(currentFolder, file)).isDirectory());
        siblingFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        const currentFileName = path.basename(currentFilePath);
        const currentIndex = siblingFiles.indexOf(currentFileName);
        let targetIndex = currentIndex + (next ? 1 : -1);

        if (targetIndex < 0 || targetIndex >= siblingFiles.length) {
            vscode.window.showInformationMessage('No adjacent file found.');
            return;
        }

        const nextFilePath = path.join(currentFolder, siblingFiles[targetIndex]);

        vscode.workspace.openTextDocument(nextFilePath).then(doc => {
            vscode.window.showTextDocument(doc);
        }, (error) => {
            vscode.window.showErrorMessage(`Failed to open file: ${error}`);
        });
    });
}

async function openNextFile(){
    await openAdjacentFile(next = true)
}

async function openPreviousFile(){
    await openAdjacentFile(next = false)
}


function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "span-decorator" is now active!');



    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255,255,0,0.5)' // Example highlight color
    });
    function highlight(){
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        // vscode.window.showInformationMessage('span.highlightText');
        vscode.languages.setTextDocumentLanguage(editor.document, 'html');
        const text = editor.document.getText();
        const regex = /articolo|articoli|comma|commi|decreto|legge/g; // Replace YourRegexPattern with your regex
        let match;
        const decorationsArray = [];

        while ((match = regex.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const decoration = { range: new vscode.Range(startPos, endPos) };

            // Check if the match is outside <span> tags
            if (isOutsideSpanTags(text, match.index)) {
                decorationsArray.push(decoration);
            }
        }

        editor.setDecorations(decorationType, decorationsArray);
    }

    let disposable = vscode.commands.registerCommand('span-decorator.highlightText',  highlight);

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('span-decorator.decorateHtml', 
    function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file to decorate text with HTML tags');
            return;
        }
    
        const selection = editor.selection;
        const text = editor.document.getText(selection);
    
        // Example: Wrap selected text with <b> tags
        const decoratedText = `<span class="citazione" data-formato_standard="${text}">${text}</span>`;
    
        editor.edit(editBuilder => {
            editBuilder.replace(selection, decoratedText);
        });
        vscode.languages.setTextDocumentLanguage(editor.document, 'html');
        editor.setDecorations(decorationType, []);
    });
    context.subscriptions.push(disposable);

    // Open next folder files
    disposable = vscode.commands.registerCommand('span-decorator.openNextFile', openNextFile);
    context.subscriptions.push(disposable);

    // Open next folder files
    disposable = vscode.commands.registerCommand('span-decorator.openPreviousFile', openPreviousFile);
    context.subscriptions.push(disposable);


    function setHtmlLanguageForEditor(editor) {
        // vscode.window.showInformationMessage('span.highlightText');
        if (editor) {
            // vscode.languages.setTextDocumentLanguage(editor.document, 'html');
            highlight();
        }
    }

    vscode.window.onDidChangeActiveTextEditor(highlight, null, context.subscriptions);
    vscode.workspace.onDidOpenTextDocument(doc => {
        highlight()
    }, null, context.subscriptions);

}

function isOutsideSpanTags(text, index) {
    // Extract the substring up to the given index
    const substring = text.substring(0, index);

    // Use regular expressions to find all opening and closing <span> tags in the substring
    const openingTags = substring.match(/<span/gi) || [];
    const closingTags = substring.match(/<\/span>/gi) || [];

    // If the number of opening and closing tags is equal, the index is outside of span tags
    return openingTags.length === closingTags.length;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
