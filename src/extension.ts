import * as vscode from 'vscode';
import axios from 'axios'; // Import Axios for HTTP requests
// Import your local model library here
// import { loadModel, predict } from 'your-local-model-library';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('deepseek-helper.askDeepSeek', async () => {
        const panel = vscode.window.createWebviewPanel(
            'deepseekChat',
            'DeepSeek Chat',
            vscode.ViewColumn.One,
            {}
        );

        panel.webview.html = getWebviewContent();

        // Load your local model here
        // const model = await loadModel('path/to/your/model');

        panel.webview.onDidReceiveMessage(async message => {
            switch (message.command) {
                case 'sendMessage':
                    try {
                        // Send a request to the Ollama server
                        const response = await axios.post('http://localhost:11434/generate', {
                            prompt: message.text,
                            // Add any other parameters required by your model
                        });

                        // Extract the generated text from the response
                        const responseText = response.data.text; // Adjust based on the actual response structure
                        panel.webview.postMessage({ command: 'receiveMessage', text: responseText });
                    } catch (error) {
                        console.error('Error communicating with Ollama:', error);
                        panel.webview.postMessage({ command: 'receiveMessage', text: 'Error generating response.' });
                    }
                    return;
            }
        });
    });

    context.subscriptions.push(disposable);
}

// Function to generate the HTML content for the webview
function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <body>
        <h1>DeepSeek Chat</h1>
        <textarea id="input" rows="4" cols="50" placeholder="Type your message here..."></textarea>
        <button id="send">Send</button>
        <div id="output"></div>
        <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('send').onclick = () => {
                const input = document.getElementById('input').value;
                vscode.postMessage({ command: 'sendMessage', text: input });
                document.getElementById('input').value = '';
            };
            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'receiveMessage') {
                    const output = document.getElementById('output');
                    output.innerHTML += '<p>' + message.text + '</p>';
                }
            });
        </script>
    </body>
    </html>`;
}

export function deactivate() {}