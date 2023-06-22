'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import { myLogger } from './util';
import { id } from './util';  // IDregex object


class AsyncZettelViewTreeItem extends vscode.TreeItem {
    //public label: string; This is public in TreeItem!
    // no wonder this works...
   
    constructor(
        public readonly pathname: string,
        public readonly basename: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
    ) {
        super(basename, collapsibleState);
        this.label = basename; // assume the label is the basename
        
        // myLogger.logMsg(`Regex: ${id.regex}`);
    
        // since we cannot make an asynchronous call to a constructor
        // and we want to consume a stream line-by-line, we return
        // an IIAFE: immediately invoked Asynchronous Function Expression
        // See: https://stackoverflow.com/questions/43431550/async-await-class-constructor/50885340#50885340

        return (async (): Promise<AsyncZettelViewTreeItem> =>{
            try {            
                const fileStream = fs.createReadStream(pathname);
                const rl = readline.createInterface({
                  input: fileStream,
                 crlfDelay: Infinity,
                });
          
                // The mixed technique does not work--
                // rl.on('line', (line) => 
            
                for await (const line of rl) {
                    
                    //const match = line?.match(/^# ((\w{1,4}\.){2,}\d\w{3}) (.+)$/);
                    // id is non-local
                    const match = id.re.exec(line);
                    if (match) {
                        // check if basename == match[1].md
                        if (basename !== `${match[1]}.md`) {
                            myLogger.logMsg(`ID ${match[1]} does not match filename ${basename}`);
                            // vscode.window.showInformationMessage(`ID ${match[1]} does not match filename ${basename}`);
                        } 
                        this.label = line; // show the H1 header
                        rl.close(); // we're done
                        return this;
                    }
                }
               
                myLogger.logMsg(`# ID TITLE not found in: ${basename}`);
                // vscode.window.showInformationMessage(`# ID TITLE header not found in: ${basename}`);
                rl.close();
                return this;
            } catch (err) {
                console.error(err);
                return this;
            }
        })() as unknown as AsyncZettelViewTreeItem;
    }
}

class ZettelViewTreeDataProvider implements vscode.TreeDataProvider<AsyncZettelViewTreeItem> {
    constructor(private workspaceRoot: string) {}

    // events and event handling for recomputing the tree
    _onDidChangeTreeData: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
    onDidChangeTreeData: vscode.Event<undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: AsyncZettelViewTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: AsyncZettelViewTreeItem): Thenable<AsyncZettelViewTreeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No markdown files found in your workspace');
            myLogger.logMsg('No markdown files found in your workspace');
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
                    
                    // an async object will determine whether to create a tree item with
                    // a filename or an H1 label

                    const treeItem =
                    (async => {
                                const obj =  new AsyncZettelViewTreeItem(path.join(this.workspaceRoot, file), 
                                        file,   
                                        vscode.TreeItemCollapsibleState.None, {
                                            command: 'vscode.open',
                                            title: '',
                                            arguments: [vscode.Uri.file(path.join(this.workspaceRoot, file))],
                                        }
                                    );
                                return obj;
                            }
                    )(); 
                    return treeItem;

                }));
            });
        });
    }
}

export function activate(context: vscode.ExtensionContext): void {
    // rootPath is deprecated, disparaged, disowned, and disconsolate
    // const workspaceRoot = vscode.workspace.rootPath;

    const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
    ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    
    if (workspaceRoot) {
        const provider = new ZettelViewTreeDataProvider(workspaceRoot);
        vscode.window.registerTreeDataProvider('zettelView', provider);

        // In case we would like to operate on the tree view...
        // this is a redesign
        // this.ftpViewer = vscode.window.createTreeView('ftpExplorer', { treeDataProvider });
        
        vscode.commands.registerCommand('zettelView.refreshEntry', () => provider.refresh());
    }
}

