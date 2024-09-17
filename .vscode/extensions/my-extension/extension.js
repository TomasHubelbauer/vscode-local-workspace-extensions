// Run `bun install` to install `@types/vscode`
const vscode = require('vscode');

function activate(/** @type {vscode.ExtensionContext} */ _context) {
  window.showInformationMessage('Hello World from my-extension!');
}

function deactivate() {
  // Do nothing
}

module.exports = {
  activate,
  deactivate
};
