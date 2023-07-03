import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AsyncZettelViewTreeItem } from './AsyncZettelViewTreeItem';
import { IncomingLinksMap } from './utils/IncomingLinksMap';
import { logger } from './utils/utils';

export class ZettelViewTreeDataProvider implements vscode.TreeDataProvider<AsyncZettelViewTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
    onDidChangeTreeData: vscode.Event<undefined> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string, private incomingLinksMap: IncomingLinksMap) {}

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: AsyncZettelViewTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: AsyncZettelViewTreeItem): Promise<AsyncZettelViewTreeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No markdown files found in your workspace');
            logger('No markdown files found in your workspace');
            return [];
        }

        try {
            const files = await fs.promises.readdir(this.workspaceRoot);
            const markdownFiles = files.filter(file => file.endsWith('.md'));

            return markdownFiles.map(file => new AsyncZettelViewTreeItem(
                path.join(this.workspaceRoot, file),
                file,
                vscode.TreeItemCollapsibleState.None,
                this.incomingLinksMap,
                {
                    command: 'vscode.open',
                    title: '',
                    arguments: [vscode.Uri.file(path.join(this.workspaceRoot, file))],
                }
            ));
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}
