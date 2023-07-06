import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AsyncZettelViewTreeItem } from './AsyncZettelViewTreeItem';
import { IncomingIDMap } from './utils/IncomingIDMap';
import { MyLogger } from './utils/MyLogger';

export class ZettelViewTreeDataProvider implements vscode.TreeDataProvider<AsyncZettelViewTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
    onDidChangeTreeData: vscode.Event<undefined> = this._onDidChangeTreeData.event;

    private _onDidSelectZettel: vscode.EventEmitter<AsyncZettelViewTreeItem> = new vscode.EventEmitter<AsyncZettelViewTreeItem>();
    onDidSelectZettel: vscode.Event<AsyncZettelViewTreeItem> = this._onDidSelectZettel.event;
    
    // Trigger this event whenever a Zettel is selected in the main view
    

    constructor(private workspaceRoot: string, private incomingIDMap: IncomingIDMap) {}

    onZettelSelected(zettel: AsyncZettelViewTreeItem): void {
        zettel.isReady.then(() => {
            this.refresh(); // Trigger a refresh of the tree view to update the labels
        });
        this._onDidSelectZettel.fire(zettel);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }


    getTreeItem(element: AsyncZettelViewTreeItem): vscode.TreeItem {
        return element;
        //return new vscode.TreeItem(element.label, element.collapsibleState);
    }
    

    async getChildren(element?: AsyncZettelViewTreeItem): Promise<AsyncZettelViewTreeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No markdown files found in your workspace');
            MyLogger.logMsg('No markdown files found in your workspace');
            return [];
        }

        
            const files = await fs.promises.readdir(this.workspaceRoot);
            const markdownFiles = files.filter(file => file.endsWith('.md'));

            const items = markdownFiles.map(file => new AsyncZettelViewTreeItem(
                path.join(this.workspaceRoot, file),
                file,
                vscode.TreeItemCollapsibleState.None,
                this.incomingIDMap,
                {
                    command: 'zettelkasten.openZettel',
                    title: '',
                    arguments: [vscode.Uri.file(path.join(this.workspaceRoot, file))],
                }
            ));
            const readyItems = await Promise.all(items.map(item => item.isReady));
            //MyLogger.logMsg(`Ready items: ${readyItems.map(item => item.label).join(', ')}`);
            return readyItems;
            
   }
}
