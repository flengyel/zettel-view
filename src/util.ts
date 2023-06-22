
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

export class IDregex {
    // The ID regex is a configuration contribution point, with a default value
    private _re: RegExp; // save the compiled regex
    private _regex: string; // save the pattern as a string
    constructor() {
        const regex = vscode.workspace.getConfiguration().get('zettelView.regex'); 
        this._regex = regex as string;
        if (!this._regex) {
            this._regex = '^# ((\\w{1,4}\\.){2,}\\d\\w{3}) (.+)$'; // set the default regex if undefined
            vscode.window.showInformationMessage(`No regex found in settings. Using default: ${this._regex}`);
        }
        this._re = new RegExp(this._regex);
    }
    
    get re(): RegExp { return this._re; }
    get regex(): string { return this._regex; }
}

// sadly, an object for compiled RegExp is needed by each ZettelViewTreeItem
export const id = new IDregex();
