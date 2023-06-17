# Zettel View: a VS Code extension to list Zettels by H1 header

Zettel View is VStudio Code extension to display a list of markdown files by their H1 header. Zettel View contributes a Zettlr-like display of Zettels to the VS Code Explorer View, as shown below.

![Zettel View](./resources/Zettel-View.png)

Clicking on any file in the Zettel View window opens the Zettel markdown file in an editor window and causes the file explorer to highlight the selected file.  Since I installed the "Auto-Open Markdown Preview" VS Code extension, the markdown preview of the selected Zettel also appears.

Zettel View makes some assumptions about Zettels. First, Zettels are markdown files with the extension `.md`. Second, a markdown file's H1 or level-one header has the form `# ID TITLE` (the `ID` is to the left; some prefer the `ID` on the right). Third, `ID` matches a regular expression specific to my `ID` scheme. Fourth, `ID.md` is the filename of the Zettel markdown file with the header `# ID TITLE`.

The second and third assumptions are hard-coded but could be made configurable in later versions of the extension. The fourth assumption isn't enforced: a mismatch between `ID.md` and the filename will appear as a discrepancy between the Zettel selected in the Zettel View and the file explorer. A warning will be emitted in that case.

Zettr has the built-in configuration setting, "Display files using first heading level 1 if available." A community plugin for Obsidian called "File Explorer Markdown Titles" once produced a similar display in the Obsidian file explorer. Unfortunately, that plugin no longer works with newer versions of Obsidian. Since VS Code is more valuable for my work than Obsidian, it made more sense to develop a VS Code extension than to modify the plugin to work with the current Obsidian API. I plan to move to VS Code the Pandoc and LaTeX integration I configured in Zettlr.

## Authors

Zettel View is a three-way collaboration between me, @flengyel, ChatGPT-4 and Bing AI. Some boilerplate code and resource files were borrowed (or left over) from Microsoft's tree-view-sample code sample, which was pared down and modified for this extension. Accordingly, the code is released under an MIT license. The text is CC BY-SA 4.0.

## VS Code API

This code uses following contribution points, activation events and APIs

### Contribution Points

- `views`

### Activation Events

- `onView:${viewId}`
- `onLanguage:markdown`

### APIs

- `window.createTreeView`
- `window.registerTreeDataProvider`
- `TreeView`
- `TreeDataProvider`
