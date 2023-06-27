import * as vscode from 'vscode';

// This is my rough and ready approach to logging: create
// a static logger class that sets an output channel for messages
// Until I add someone else's logger to the list of dependencies,
// you'll have to put up with self-contained code.

export class myLogger {
    static readonly myExtension = "Zettel View";
    static readonly logOutputChannel = vscode.window.createOutputChannel(this.myExtension);
    static logMsg(msg : string): void {
        const now = new Date();  
        const timestamp = now.toLocaleString();
        this.logOutputChannel.appendLine(`[${timestamp}] ${msg}`);
    }
}
