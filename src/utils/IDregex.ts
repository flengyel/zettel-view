import * as vscode from 'vscode';

export class IDregex {
    // The ID regex is a configuration contribution point, with a default value
    private _h1RegExp: RegExp; // save the compiled regex
    private _h1RegExpStr: string; // save the pattern as a string
    private _idRegExp: RegExp; // save the compiled regex
    private _idRegExpStr: string; // save the first pattern group as a string
    private _linkRegExp: RegExp; // save the compiled regex
    private _linkRegExpStr: string; // save the pattern as a string
    constructor() {
        const regex = vscode.workspace.getConfiguration().get('zettelView.regex'); 
        this._h1RegExpStr = regex as string;
        if (!this._h1RegExpStr) {
            this._h1RegExpStr = '^# ((\\w{1,4}\\.){2,}\\d\\w{3})'; // set the default regex if undefined
            vscode.window.showInformationMessage(`No regex found in settings. Using default: ${this._h1RegExpStr}`);
        }
        this._h1RegExp = new RegExp(this._h1RegExpStr);
        this._idRegExpStr = this._h1RegExpStr.slice(3); // remove the ^# from the front
        this._idRegExp = new RegExp(this._idRegExpStr);
        this._linkRegExpStr = '\\[\\[(' + this._idRegExpStr + ')\\]\\]'; // regex for markdown links
        this._linkRegExp = new RegExp(this._linkRegExpStr);
    }
    
    get h1RegExp(): RegExp { return this._h1RegExp; }
    get h1RegExpStr(): string { return this._h1RegExpStr; }
    get idRegExp(): RegExp { return this._idRegExp; }
    get idRegExpStr(): string { return this._idRegExpStr; }
    get linkRegExp(): RegExp { return this._linkRegExp; }
    get linkRegExpStr(): string { return this._linkRegExpStr; }
}

