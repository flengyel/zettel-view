import * as vscode from 'vscode';
import * as fs from 'fs';
import * as readline from 'readline';
import { idRegex, extractIDFromFilename } from './utils/utils';
import { IncomingLinksMap } from './utils/IncomingLinksMap';
import { MyLogger } from './utils/MyLogger';
//import { IncomingLinksViewTreeDataProvider } from './IncomingLinksViewTreeDataProvider';

export class AsyncZettelViewTreeItem extends vscode.TreeItem {
    // public label: string; 
    public isReady: Promise<AsyncZettelViewTreeItem>;
    public incomingLinks: Set<string> = new Set<string>();
    private idMatch = false;
    private markdownID: string;
    
    constructor(
        public readonly pathname: string,
        public readonly basename: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private incomingLinksMap: IncomingLinksMap,
        public readonly command?: vscode.Command,
    ) {
        super(basename, collapsibleState);
        this.label = basename;

        MyLogger.logMsg(`AsyncZettelViewTreeItem constructor: this.label is ${this.label}`);
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
                            MyLogger.logMsg(`ID MATCH: this.label is supposed to be ${this.label}`); 
                        }                          
                    }
                    // all links are of the form [[ID]] or [[ID|TITLE]]
					// I don't know if Zettlr understands [[ID|TITLE]] 
                    let match;
                    while ((match = idRegex.linkRegExp.exec(line)) !== null) {
                        this.incomingLinksMap.addLink(match[1], this.markdownID);
                        //MyLogger.logMsg(`Added incoming link from ${match[1]} to ${this.markdownID}`);
                    }
                }

                if (!this.idMatch) {
                    MyLogger.logMsg(`# ID TITLE not found in: ${basename}`);
                }

                rl.close();
                this.incomingLinks = this.incomingLinksMap.getIncomingLinksFor(this.markdownID);

                return this;
            } catch (err) {
                console.error(err);
                return this;
            }
        })() as unknown as Promise<AsyncZettelViewTreeItem>; 
    }

    getID(): string {
        return this.markdownID;
    }
}
