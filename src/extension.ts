'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

class MarkdownTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
    ) {
        super(label, collapsibleState);
    }
}

class MarkdownFilesProvider implements vscode.TreeDataProvider<MarkdownTreeItem> {
    constructor(private workspaceRoot: string) {}

    getTreeItem(element: MarkdownTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MarkdownTreeItem): Thenable<MarkdownTreeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No markdown files found in your workspace');
            return Promise.resolve([]);
        }

        return new Promise(resolve => {
            fs.readdir(this.workspaceRoot, (err, files) => {
                if (err) {
                    console.error(err);
                    return resolve([]);
                }

                const markdownFiles = files.filter(file => file.endsWith('.md'));

                resolve(markdownFiles.map(file => {
                    const fileContents = fs.readFileSync(path.join(this.workspaceRoot, file)).toString();
                    const lines = fileContents.split('\n');
                    const firstH1Line = lines.find(line => line.startsWith('# '));
                    const match = firstH1Line?.match(/^# ((\w{1,4}\.){2,}\d\w{3}) (.+)$/);

                    if (match && `${match[1]}.md` === file) {
                        const label = `${match[1]} ${match[match.length-1]}`;
                        return new MarkdownTreeItem(label, vscode.TreeItemCollapsibleState.None, {
                            command: 'vscode.open',
                            title: '',
                            arguments: [vscode.Uri.file(path.join(this.workspaceRoot, file))],
                        });
                    } else {
                        return new MarkdownTreeItem(file, vscode.TreeItemCollapsibleState.None, {
                            command: 'vscode.open',
                            title: '',
                            arguments: [vscode.Uri.file(path.join(this.workspaceRoot, file))],
                        });
                    }
                }));
            });
        });
    }
}

export function activate(context: vscode.ExtensionContext) {
    const workspaceRoot = vscode.workspace.rootPath;
    if (workspaceRoot) {
        const provider = new MarkdownFilesProvider(workspaceRoot);
        vscode.window.registerTreeDataProvider('markdownFiles', provider);
    }
}
