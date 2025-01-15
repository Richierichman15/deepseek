import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('deepseek-helper.askDeepSeek', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText) {
            vscode.window.showErrorMessage('No text selected.');
            return;
        }

        const userInput = await vscode.window.showInputBox({
            placeHolder: 'Enter your question or prompt for DeepSeek...',
        });

        if (!userInput) {
            return;
        }

        try {
            const response = await axios.post(
                'https://api.deepseek.com', 
                {
                    prompt: `${selectedText}\n\n${userInput}`,
                    max_tokens: 150,
                },
                {
                    headers: {
                        'Authorization': `Bearer sk-d5ffdc7c5eae4b4586cc2b45070d4897`, 
                        'Content-Type': 'application/json',
                    },
                }
            );

            const output = response.data.choices[0].text; 
            const document = await vscode.workspace.openTextDocument({
                content: output,
                language: editor.document.languageId,
            });
            vscode.window.showTextDocument(document);
        } catch (error) {
            vscode.window.showErrorMessage('Failed to call DeepSeek API. Check your API key and network connection.');
            console.error(error);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}