import * as vscode from 'vscode';

export class IDregex {
    // The ID regex is a configuration contribution point, with a default value
    private _h1re: RegExp; // save the compiled regex
    private _h1regex: string; // save the pattern as a string
    private _idre: RegExp; // save the compiled regex
    private _idregex: string; // save the first pattern group as a string
    private _linkregex: string; // save the pattern as a string
    private _linkre: RegExp; // save the compiled regex
    constructor() {
        const regex = vscode.workspace.getConfiguration().get('zettelView.regex'); 
        this._h1regex = regex as string;
        if (!this._h1regex) {
            this._h1regex = '^# ((\\w{1,4}\\.){2,}\\d\\w{3})'; // set the default regex if undefined
            vscode.window.showInformationMessage(`No regex found in settings. Using default: ${this._h1regex}`);
        }
        this._h1re = new RegExp(this._h1regex);
        this._idregex = this._h1regex.slice(3); // remove the ^# from the front
        this._idre = new RegExp(this._idregex);
        this._linkregex = '\\[\\[(' + this._idregex + ')\\]\\]'; // regex for markdown links
        this._linkre = new RegExp(this._linkregex);
    }
    
    get h1re(): RegExp { return this._h1re; }
    get h1regex(): string { return this._h1regex; }
    get idre(): RegExp { return this._idre; }
    get idregex(): string { return this._idregex; }
    get linkre(): RegExp { return this._linkre; }
    get linkregex(): string { return this._linkregex; }
}
