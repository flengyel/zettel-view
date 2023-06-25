
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
    private _h1re: RegExp; // save the compiled regex
    private _h1regex: string; // save the pattern as a string
    private _idre: RegExp; // save the compiled regex
    private _idregex: string; // save the first pattern group as a string
    constructor() {
        const regex = vscode.workspace.getConfiguration().get('zettelView.regex'); 
        this._h1regex = regex as string;
        if (!this._h1regex) {
            this._h1regex = '^# ((\\w{1,4}\\.){2,}\\d\\w{3})'; // set the default regex if undefined
            vscode.window.showInformationMessage(`No regex found in settings. Using default: ${this._h1regex}`);
        }
        this._h1re = new RegExp(this._h1regex);
        this._idregex = this._h1re.source.slice(3); // remove the ^# from the front
        this._idre = new RegExp(this._idregex);

    }
    
    get h1re(): RegExp { return this._h1re; }
    get h1regex(): string { return this._h1regex; }
    get idre(): RegExp { return this._idre; }
    get idregex(): string { return this._idregex; }
}

// sadly, an object for compiled RegExp is needed by each ZettelViewTreeItem
export const id = new IDregex();
