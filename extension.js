// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
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
        vscode.window.showInformationMessage('span.highlightText');

        const text = editor.document.getText();
        const regex = /articol|comm|decreto|legge|\d+/g; // Replace YourRegexPattern with your regex
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
