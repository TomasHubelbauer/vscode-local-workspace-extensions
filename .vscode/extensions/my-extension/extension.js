// Run `bun install` to install `@types/vscode`
// See https://code.visualstudio.com/api/references/vscode-api for the reference
const vscode = require('vscode');

function activate(/** @type {vscode.ExtensionContext} */ _context) {
  // Uncomment this to see the extension is activated upon VS Code startup
  //vscode.window.showInformationMessage('Hello World from my-extension!');
}

function deactivate() {
  // Do nothing
}

module.exports = {
  activate,
  deactivate
};
