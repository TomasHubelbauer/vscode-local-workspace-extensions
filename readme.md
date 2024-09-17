# VS Code local workspace extensions

This repository demonstrates the use of local workspace extensions in VS Code.
Local workspace extensions are a VS Code feature since v1.89 which adds support
for running extensions from source code when they are placed in the `.vscode`
directory's `extensions` subdirectory.

[VS Code 1.89 release notes: Local workspace extensions](https://code.visualstudio.com/updates/v1_89#_local-workspace-extensions)

This is in contrast to running extensions off VSIX files or installing them from
the [Visual Studio Marketplace for VS Code](https://marketplace.visualstudio.com/vscode).

The benefit of this approach is that extensions never even need to be packaged,
much less published, removing a big pain-point from the process of authoring
extensions for personal or team use.

Here the local workspace extension is put in the `my-extension` subdirectory of
the above mentioned directory.
I've followed the [Your First Extension guide](https://code.visualstudio.com/updates/v1_89#_local-workspace-extensions)
to set up this simple extension.
I've not opted to use JavaScript since I do not wish to introduce a build step
of any sort, I might explore this later.
For this reason I took inspiration from the [helloworld-minimal-sample](https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-minimal-sample)
extension sample as it contains the minimal amount of setup required.

The extension needs to be installed once by going to Extensions > Recommended
and installing from there.
Once installed, it will self-update based on the source code after each VS Code
startup.

[Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy)
is another excellent resource for learning about VS Code extension development.

Note that until [Support dynamic import under NodeJS](https://github.com/microsoft/vscode-loader/issues/36)
and the related [Enable consuming of ES modules in extensions](https://github.com/microsoft/vscode/issues/130367)
are resolved, the extension cannot use ESM `import`/`export` syntax.

Note that the *Developer: Reload Window* commands needds to be used to reload
the extension and make code changes take effect.
The *Extensions: Check for Extension Updates* nor *Extensions: Refresh* commands
will do the trick.

Use the Output pane in VS Code to check for extension host errors with loading
your extension if you're facing any.

## Extension samples

### My extension

I added the simplest possible extension that could be authored.
See `.vscode/extensions/my-extension/extension.js` and uncomment the live in
`activate`, then restart VS Code to see the extension come alive and display
the information popup.

### Atlassian Jira ticket code linker

Linkifiers Atlassian Jira ticket codes in MarkDown documents. E.g.: TICKET-1.

This is a resurrection of https://github.com/TomasHubelbauer/vscode-markdown-jira-links,
but in the form of a local workspace extension!

This extension contributes configuration to set up the ticket codes and the
corresponding URLs.
Use `@ext:TomasHubelbauer.atlassian-jira-ticket-code-linker` to filter the
extension settings in the VS Code settings editor or use `settings.json` either
at the user level or the workspace level:

```json
{
  "atlassianJiraTicketCodeLinker": [
    {
      "code": "TICKET",
      "url": "https://jira.atlassian.com/browse/"
    }
  ]
}
```
