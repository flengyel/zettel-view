
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { logger, idregex, extractIDFromFilename } from './utils/utils';
import { IncomingLinksMap } from './utils/IncomingLinksMap';

export class AsyncZettelViewTreeItem extends vscode.TreeItem {
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
        this.markdownID = extractIDFromFilename(basename);

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
                
				// Duplication to remove the error that "this.markdownID is used before it is assigned"
				this.markdownID = extractIDFromFilename(basename);

                for await (const line of rl) {
                    const h1match = idregex.h1RegExp.exec(line);
                    if (h1match) {
                        if (basename !== `${h1match[1]}.md`) {
                            logger(`ID ${h1match[1]} does not match filename ${basename}`);
                        } else {
                            this.idMatch = true;
                            this.label = line; 
                        }                          
                    }
                    // all links are of the form [[ID]] or [[ID|TITLE]]
					// I don't know if Zettlr understands [[ID|TITLE]] 
                    let match;
                    const linkRegex = /\[\[([\w\\.]+)\]\]/g;
                    while ((match = linkRegex.exec(line)) !== null) {
                        this.incomingLinksMap.addLink(match[1], this.markdownID); 
                    }
                }

                if (!this.idMatch) {
                    logger(`# ID TITLE not found in: ${basename}`);
                }

                rl.close();
                this.incomingLinks = this.incomingLinksMap.getIncomingLinksFor(this.markdownID);

                return this;
            } catch (err) {
                console.error(err);
                return this;
            }
        })() as unknown as AsyncZettelViewTreeItem;
    }

    getID(): string {
        return this.markdownID;
    }
}
