// Run `bun install` to install `@types/vscode`
// See https://code.visualstudio.com/api/references/vscode-api for the reference
const vscode = require('vscode');

/** @type {vscode.TextEditorDecorationType} */
let textEditorDecorationType;

async function activate(/** @type {vscode.ExtensionContext} */ context) {
  // TODO: Listen for configuration changes instead of reloading in the provider
  // See https://github.com/microsoft/vscode-extension-samples/blob/main/configuration-sample/src/extension.ts#L192
  const configuration = await loadAndValidateConfiguration();

  textEditorDecorationType = vscode.window.createTextEditorDecorationType({});

  context.subscriptions.push(textEditorDecorationType);

  const provider = new AtlassianJiraTicketLinkProvider();
  context.subscriptions.push(vscode.languages.registerDocumentLinkProvider({ scheme: 'file', language: 'markdown' }, provider));
  context.subscriptions.push(vscode.languages.registerDocumentLinkProvider({ scheme: 'untitled', language: 'markdown' }, provider));

  if (!configuration) {
    return;
  }

  //vscode.window.showInformationMessage(`Atlassian Jira Ticket Code Linker on for ${pluralize(configuration.length, 'code')} ${configuration.map(item => item.code).join(', ')}`);
}

function deactivate() {
  // Do nothing
}

module.exports = {
  activate,
  deactivate
};

async function loadAndValidateConfiguration() {
  const configuration = vscode.workspace.getConfiguration('atlassianJiraTicketCodeLinker');

  /** @type {{ code: string; url: string; }[] | undefined} */
  const mapping = configuration.get('mapping');
  if (!mapping) {
    /** @type {vscode.MessageItem} */
    const openSettingsMessageItem = {
      title: 'Open Settings'
    };

    const selectedItem = await vscode.window.showInformationMessage(
      'No mapping configured',
      {
        modal: true,
        detail: 'Please configure the mapping in the user or workspace settings'
      },
      openSettingsMessageItem
    );

    if (selectedItem === openSettingsMessageItem) {
      // TODO: Figure out why this doesn't open JSON or focus the JSON key
      // vscode.commands.executeCommand('workbench.action.openSettings', {
      //   // ISettingsEditorOptions
      //   target: vscode.ConfigurationTarget.WorkspaceFolder,
      //   revealSetting: {
      //     key: 'atlassianJiraTicketCodeLinker.mapping',
      //     edit: true,
      //   },

      //   // IOpenSettingsOptions
      //   jsonEditor: true,
      //   openToSide: true,
      // });

      vscode.commands.executeCommand('workbench.action.openWorkspaceSettings', 'atlassianJiraTicketCodeLinker.mapping');
    }

    return;
  }

  if (!Array.isArray(mapping)) {
    vscode.window.showErrorMessage('Mapping must be an array of objects');
    return;
  }

  for (const item of mapping) {
    if (!('code' in item)) {
      vscode.window.showErrorMessage('Mapping must have a "code" key');
      return;
    }

    if (typeof item.code !== 'string') {
      vscode.window.showErrorMessage('Mapping "code" key must be a string');
      return;
    }

    const regex = /^[A-Z]+$/;
    if (!regex.test(item.code)) {
      vscode.window.showErrorMessage(`Mapping "code" key must be a \`${regex}\` string`);
      return;
    }

    if (!('url' in item)) {
      vscode.window.showErrorMessage('Mapping must have a "ticket" key');
      return;
    }

    if (!URL.canParse(item.url) || new URL(item.url).pathname !== '/browse/') {
      vscode.window.showErrorMessage('Mapping "ticket" key must be a valid `/browse` HTTP(S) URL');
      return;
    }

    if (typeof item.url !== 'string') {
      vscode.window.showErrorMessage('Mapping "ticket" key must be a string');
      return;
    }
  }

  return mapping;
}

function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || `${singular}s`);
}

/** @implements {vscode.DocumentLinkProvider} */
class AtlassianJiraTicketLinkProvider {
  async provideDocumentLinks(
    /** @type {vscode.TextDocument} */
    document,
    /** @type {vscode.CancellationToken} */
    token) {
    const configuration = await loadAndValidateConfiguration();
    const text = document.getText();

    /** @type {vscode.DocumentLink[]} */
    const links = [];
    for (const { code, url } of configuration) {
      const regex = new RegExp(`(?<!\/)(?<ticket>${code}-\\d+)`, 'g');

      /** @type {RegExpExecArray | null} */
      let match;
      while (match = regex.exec(text)) {
        if (!match.groups || !match.groups.ticket) {
          throw new Error('Match does not have a ticket group');
        }

        const start = document.positionAt(match.index);
        const end = document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(start, end);
        const link = new vscode.DocumentLink(range, vscode.Uri.parse(url + match.groups.ticket));
        links.push(link);
      }

      const editor = await vscode.window.showTextDocument(document);

      /** @type {vscode.DecorationOptions[]} */
      const decorations = links.map(link => ({
        range: link.range,
        hoverMessage: link.target.toString()
      }));

      editor.setDecorations(textEditorDecorationType, decorations);
      return links;
    }
  }
}
