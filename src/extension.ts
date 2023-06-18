'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';


class AsyncMarkdownTreeItem extends vscode.TreeItem {
    public label: string;
    constructor(
        public readonly pathname: string,
        public readonly basename: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
    ) {
        super(basename, collapsibleState);
        this.label = basename; // we will assume that the label is the basename
        
        return (async (): Promise<AsyncMarkdownTreeItem> =>{
            const fileStream = fs.createReadStream(pathname);
            const rl = readline.createInterface({
              input: fileStream,
              crlfDelay: Infinity,
            });
            // Note: we use the crlfDelay option to recognize all instances of CR LF
            // ('\r\n') in input.txt as a single line break.
          
            for await (const line of rl) {
              const match = line?.match(/^# ((\w{1,4}\.){2,}\d\w{3}) (.+)$/);
              // console.log(`Line from file: ${line}`);
              if (match){
                //console.log(`we matched ${match[match.length-1]}`);
                this.label = line; // show the H1 header
                rl.close(); // we're done
                return this;
              }
            }
            console.log(`Markdown file not a Zettel: ${basename}`);
            rl.close();
            return this;
        })() as unknown as AsyncMarkdownTreeItem;
    }
}

class MarkdownFilesProvider implements vscode.TreeDataProvider<AsyncMarkdownTreeItem> {
    constructor(private workspaceRoot: string) {}

    getTreeItem(element: AsyncMarkdownTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: AsyncMarkdownTreeItem): Thenable<AsyncMarkdownTreeItem[]> {
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
                    
                    // an async object will determine whether to create a tree item with
                    // a filename or an H1 label

                    const treeItem =
                    (async => {
                    const obj =  new AsyncMarkdownTreeItem(path.join(this.workspaceRoot, file), file, vscode.TreeItemCollapsibleState.None, {
                        command: 'vscode.open',
                        title: '',
                        arguments: [vscode.Uri.file(path.join(this.workspaceRoot, file))],
                    });
                    return obj;
                  })(); 
                  return treeItem;

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
