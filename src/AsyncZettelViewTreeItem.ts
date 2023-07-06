import * as vscode from 'vscode';
import * as fs from 'fs';
import * as readline from 'readline';
import { idRegex, extractIDFromFilename } from './utils/utils';
import { IncomingIDMap } from './utils/IncomingIDMap';
import { MyLogger } from './utils/MyLogger';

export class AsyncZettelViewTreeItem extends vscode.TreeItem {
    // public label: string; 
    public isReady: Promise<AsyncZettelViewTreeItem>;
    public incomingIDs: Set<string> = new Set<string>();
    private idMatch = false;
    private markdownID: string;
    
    constructor(
        public readonly pathname: string,
        public readonly basename: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private incomingIDMap: IncomingIDMap,
        public readonly command?: vscode.Command,
    ) {
        super(basename, collapsibleState);
        this.label = basename;

        // MyLogger.logMsg(`AsyncZettelViewTreeItem constructor: this.label is ${this.label}`);
        this.markdownID = extractIDFromFilename(basename);

		// since we cannot make an asynchronous call to a constructor
        // and we want to consume a stream line-by-line, we return
        // an IIAFE: immediately invoked Asynchronous Function Expression
        // See: https://stackoverflow.com/questions/43431550/async-await-class-constructor/50885340#50885340

		this.isReady = (async ():  Promise<AsyncZettelViewTreeItem> => {
            try {            
                const fileStream = fs.createReadStream(pathname);
                const rl = readline.createInterface({
                  input: fileStream,
                  crlfDelay: Infinity,
                });
                
                // Reassign markdownID here for use in the async function
                // Needed dur to TypeScript's "strictPropertyInitialization" rule, 
				// which is a part of the "strict" compilation option. This rule 
				// requires that all properties of a class are initialized in 
				// the constructor, or have a default value assigned to them.
				
				this.markdownID = extractIDFromFilename(basename);
                
				for await (const line of rl) {
                    //MyLogger.logMsg(`Line from file: ${basename} ${line}`);
                    const h1match = idRegex.h1RegExp.exec(line);
                    if (h1match) {
                        //MyLogger.logMsg(`h1match: ${h1match[1]}`);
                        if (basename !== `${h1match[1]}.md`) {
                            MyLogger.logMsg(`ID ${h1match[1]} does not match filename ${basename}`);
                        } else {
                            this.idMatch = true;
                            this.label = line;
                            //MyLogger.logMsg(`ID MATCH: this.label is supposed to be ${this.label}`); 
                        }                          
                    }
                    // all IDs are of the form [[ID]] or [[ID|TITLE]]
					// I don't know if Zettlr understands [[ID|TITLE]] 
                    let match;
                    while ((match = idRegex.linkRegExp.exec(line)) !== null) {
                        this.incomingIDMap.addID(this.markdownID, match[1]);
                        if (this.markdownID == `ham.2.0.23.0124.1142`) {
                            // what is going on with this ID?
                            MyLogger.logMsg(`Added incoming link from ${this.markdownID} to ${match[1]}`);
                        }
                    }
                }

                if (!this.idMatch) {
                    MyLogger.logMsg(`# ID TITLE not found in: ${basename}`);
                }

                rl.close();
                this.incomingIDs = this.incomingIDMap.getIncomingIDsFor(this.markdownID);
                if (this.markdownID == `ham.2.0.23.0124.1142`) {
                    MyLogger.logMsg(`Incoming IDs for ${this.markdownID}: ${Array.from(this.incomingIDs)}`);
                }
                //MyLogger.logMsg(`Incoming IDs for ${this.markdownID}: ${Array.from(this.incomingIDs)}`);

                return this;
            } catch (err) {
                this.label = basename;  // a default value
                console.error(err);
                return this;
            }
        })() as unknown as Promise<AsyncZettelViewTreeItem>; 
    }

    getID(): string {
        return this.markdownID;
    }
}
