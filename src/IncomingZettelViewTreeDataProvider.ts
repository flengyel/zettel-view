import * as vscode from 'vscode';
import * as path from 'path';
import { AsyncZettelViewTreeItem } from './AsyncZettelViewTreeItem';
import { IncomingIDMap } from './utils/IncomingIDMap';
import { MyLogger } from './utils/MyLogger';

export class IncomingZettelViewTreeDataProvider implements vscode.TreeDataProvider<AsyncZettelViewTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
    readonly onDidChangeTreeData: vscode.Event<undefined> = this._onDidChangeTreeData.event;

    private currentMarkdownFile: string | null = null;

	constructor(private workspaceRoot: string, private incomingIDMap: IncomingIDMap) {
		vscode.workspace.onDidOpenTextDocument((document) => {
			if (document.languageId === 'markdown') {
				this.currentMarkdownFile = document.fileName;
				this.refresh();
			}
		});
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				MyLogger.logMsg(`Editor changed: ${editor.document.fileName}`);
				if (editor.document.languageId === 'markdown') {
					this.currentMarkdownFile = editor.document.fileName;
					MyLogger.logMsg(`Current markdown file is ${this.currentMarkdownFile}`);
					this.refresh();
				} else {
					MyLogger.logMsg(`Editor is not a markdown file.`);
				}
			} else {
				MyLogger.logMsg(`No active editor.`);
			}
		});
	}
	

    //constructor(private workspaceRoot: string, private incomingLinksMap: IncomingLinksMap) {
		//vscode.window.onDidChangeActiveTextEditor(editor => {
		//	if (editor && editor.document.languageId === 'markdown') {
        //        this.currentMarkdownFile = editor.document.fileName;
				//MyLogger.logMsg(`Incoming Zettel View: Current markdown file is ${this.currentMarkdownFile}`);
        //        this.refresh();
        //    }
        //});
    //}

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: AsyncZettelViewTreeItem): vscode.TreeItem {
        return element;
    }

	async getChildren(element?: AsyncZettelViewTreeItem): Promise<AsyncZettelViewTreeItem[]> {
		if (!this.currentMarkdownFile) {
			vscode.window.showInformationMessage('Incoming Zettel View: No markdown file in focus');
			MyLogger.logMsg('Incoming Zettel View: No markdown file in focus');
			return [];
		}
	
		const id = path.basename(this.currentMarkdownFile, '.md');
		const incomingIDs = this.incomingIDMap.getIncomingIDsFor(id);
		// MyLogger.logMsg(`Incoming IDs for ${id}: ${JSON.stringify(incomingIDs)}`); 
	
		if (!incomingIDs || incomingIDs.size === 0) {
			vscode.window.showInformationMessage(`No incoming IDs for the file ${this.currentMarkdownFile}`);
			MyLogger.logMsg(`No incoming IDs for the file ${this.currentMarkdownFile}`);
			return [];
		}
		

		const items = await Promise.all(Array.from(incomingIDs).map(async (id: string) => {
			const pathname = path.join(this.workspaceRoot, `${id}.md`);
			const basename = `${id}.md`;
			const item = new AsyncZettelViewTreeItem(
				pathname,
				basename,
				vscode.TreeItemCollapsibleState.None,
				this.incomingIDMap,
				{
					command: 'vscode.open',
					title: '',
					arguments: [vscode.Uri.file(pathname)],
				}
			);
	
			await item.isReady;
			return item;
		}));
	
		return items;
	}

}
