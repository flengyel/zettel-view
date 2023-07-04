import * as vscode from 'vscode';
import { AsyncZettelViewTreeItem } from './AsyncZettelViewTreeItem';
import { IncomingLinksMap } from './utils/IncomingLinksMap';
import { MyLogger } from './utils/MyLogger';

export class IncomingLinksViewTreeDataProvider implements vscode.TreeDataProvider<AsyncZettelViewTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
    readonly onDidChangeTreeData: vscode.Event<undefined> = this._onDidChangeTreeData.event;

    private currentMarkdownFile: string | null = null;

    constructor(private workspaceRoot: string, private incomingLinksMap: IncomingLinksMap) {
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'markdown') {
                this.currentMarkdownFile = editor.document.fileName;
                this.refresh();
            }
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: AsyncZettelViewTreeItem): vscode.TreeItem {
        return element;
    }

	async getChildren(element?: AsyncZettelViewTreeItem): Promise<AsyncZettelViewTreeItem[]> {
		if (!this.currentMarkdownFile) {
			vscode.window.showInformationMessage('No markdown file in focus');
			MyLogger.logMsg('No markdown file in focus');
			return [];
		}
	
		const incomingLinks = this.incomingLinksMap.getIncomingLinksFor(this.currentMarkdownFile);
	
		if (!incomingLinks) {
			vscode.window.showInformationMessage(`No incoming links for the file ${this.currentMarkdownFile}`);
			MyLogger.logMsg(`No incoming links for the file ${this.currentMarkdownFile}`);
			return [];
		}
	
		return Array.from(incomingLinks).map((link: string) => new AsyncZettelViewTreeItem(
			link, // Incoming link file path
			vscode.workspace.asRelativePath(link), // Relative file path as label
			vscode.TreeItemCollapsibleState.None,
			this.incomingLinksMap,
			{
				command: 'vscode.open',
				title: '',
				arguments: [vscode.Uri.file(link)],
			}
		));
	}
}
