const vscode = require('vscode'); 

function activate(context) {
    const disposable = vscode.commands.registerCommand('restApiTester.openPanel', () => {
        const panel = vscode.window.createWebviewPanel(
            'restApiTester',
            'REST API Tester',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
            }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(
            async (message) => {
                const { url, method, headers, body } = message;

                try {
                    const parsedHeaders = headers ? JSON.parse(headers) : {};

                    const response = await fetch(url, {
                        method,
                        headers: parsedHeaders,
                        body: method !== 'GET' && body ? body : null,
                    });

                    const responseBody = await response.text();
                    panel.webview.postMessage({ response: responseBody });
                } catch (error) {
                    panel.webview.postMessage({ response: `Error: ${error.message}` });
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>REST API Tester</title>
        <style>
            :root {
                --primary-color: #007acc;
                --bg-color: #ffffff;
                --text-color: #333333;
                --border-color: #cccccc;
                --hover-color: #005999;
                --input-bg: #f8f9fa;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: var(--bg-color);
                color: var(--text-color);
            }

            h1, h2 {
                color: var(--primary-color);
                margin-bottom: 1.5rem;
                border-bottom: 2px solid var(--primary-color);
                padding-bottom: 0.5rem;
            }

            #apiForm {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            label {
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: var(--text-color);
            }

            input, select, textarea {
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                font-size: 14px;
                background-color: var(--input-bg);
                transition: border-color 0.3s, box-shadow 0.3s;
            }

            input:focus, select:focus, textarea:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
            }

            select {
                cursor: pointer;
            }

            textarea {
                min-height: 100px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
                resize: vertical;
            }

            #sendRequest {
                background-color: var(--primary-color);
                color: white;
                border: none;
                padding: 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
                transition: background-color 0.3s;
            }

            #sendRequest:hover {
                background-color: var(--hover-color);
            }

            #sendRequest:active {
                transform: translateY(1px);
            }

            #response {
                background-color: var(--input-bg);
                border: 1px solid var(--border-color);
                border-radius: 4px;
                padding: 1rem;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
                white-space: pre-wrap;
                word-break: break-word;
                max-height: 400px;
                overflow-y: auto;
            }

            /* Dark theme support */
            @media (prefers-color-scheme: dark) {
                :root {
                    --primary-color: #0098ff;
                    --bg-color: #1e1e1e;
                    --text-color: #ffffff;
                    --border-color: #404040;
                    --hover-color: #66b9ff;
                    --input-bg: #2d2d2d;
                }

                #response {
                    background-color: #252525;
                }
            }

            /* Responsive design */
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }

                input, select, textarea {
                    font-size: 16px; /* Prevent zoom on mobile */
                }
            }
        </style>
    </head>
    <body>
        <h1>REST API Tester</h1>
        <form id="apiForm">
            <label for="url">URL:</label>
            <input type="text" id="url" placeholder="https://api.example.com" required />
            
            <label for="method">Method:</label>
            <select id="method">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
            </select>
            
            <label for="headers">Headers (JSON format):</label>
            <textarea id="headers" placeholder='{ "Content-Type": "application/json" }'></textarea>
            
            <label for="body">Body (for POST/PUT/PATCH):</label>
            <textarea id="body" placeholder='{"key": "value"}'></textarea>
            
            <button type="button" id="sendRequest">Send Request</button>
        </form>

        <h2>Response:</h2>
        <pre id="response"></pre>

        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById('sendRequest').addEventListener('click', () => {
                const url = document.getElementById('url').value;
                const method = document.getElementById('method').value;
                const headers = document.getElementById('headers').value;
                const body = document.getElementById('body').value;

                document.getElementById('response').innerText = 'Loading...';
                vscode.postMessage({ url, method, headers, body });
            });

            window.addEventListener('message', (event) => {
                const { response } = event.data;
                document.getElementById('response').innerText = response;
            });
        </script>
    </body>
    </html>
    `;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};