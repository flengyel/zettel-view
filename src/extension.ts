'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';


// This is my rough and ready approach to logging: create
// a static logger class that sets an output channel for messages
// Until I add someone else's logger to the list of dependencies,
// you'll have to put up with self-contained code.

class myLogger {
    static readonly myExtension = "Zettel View";
    static readonly logOutputChannel = vscode.window.createOutputChannel(this.myExtension);
    static logMsg(msg : string): void {
        const now = new Date();  
        const timestamp = now.toLocaleString();
        this.logOutputChannel.appendLine(`[${timestamp}] ${msg}`);
    }
}

class AsyncMarkdownTreeItem extends vscode.TreeItem {
    //public label: string; This is public in TreeItem!
    // no wonder why this works...
    constructor(
        public readonly pathname: string,
        public readonly basename: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
    ) {
        super(basename, collapsibleState);
        this.label = basename; // assume the label is the basename

        // since we cannot make an asynchronous call to a constructor
        // and we want to consume a stream line-by-line, we return
        // an IIAFE: immediately invoked Asynchronous Function Expression
        // See: https://stackoverflow.com/questions/43431550/async-await-class-constructor/50885340#50885340

        return (async (): Promise<AsyncMarkdownTreeItem> =>{
            try {            
                const fileStream = fs.createReadStream(pathname);
                const rl = readline.createInterface({
                  input: fileStream,
                 crlfDelay: Infinity,
                });
          
                // The mixed technique does not work--
                // rl.on('line', (line) => 
            
                for await (const line of rl) {
                    const match = line?.match(/^# ((\w{1,4}\.){2,}\d\w{3}) (.+)$/);
                    // console.log(`Line from file: ${line}`);
                    if (match) {
                        // check if basename == match[1].md
                        if (basename !== `${match[1]}.md`) {
                            myLogger.logMsg(`ID ${match[1]} does not match filename ${basename}`);
                            //vscode.window.showInformationMessage(`ID ${match[1]} does not match filename ${basename}`);
                        } 
                        this.label = line; // show the H1 header
                        rl.close(); // we're done
                        return this;
                    }
                }
               
                myLogger.logMsg(`# ID TITLE header not found in: ${basename}`);
                //vscode.window.showInformationMessage(`# ID TITLE header not found in: ${basename}`);
                rl.close();
                return this;
            } catch (err) {
                console.error(err);
                return this;
            }
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

