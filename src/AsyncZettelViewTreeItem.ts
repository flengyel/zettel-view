import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { logger, idregex, extractIDFromFilename } from './utils/utils';
import { IncomingLinksMap } from './utils/IncomingLinksMap';

export class AsyncZettelViewTreeItem extends vscode.TreeItem {
    public incomingLinks: Set<string> = new Set<string>();
    private idMatch = false;
    
    constructor(
        public readonly pathname: string,
        public readonly basename: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private incomingLinksMap: IncomingLinksMap,
        public readonly command?: vscode.Command,
    ) {
        super(basename, collapsibleState);
        this.label = basename;
        const ID = extractIDFromFilename(basename);

        // The rest of your code...
	
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
                // Read the file line by line
                for await (const line of rl) {
                    const h1match = idregex.h1RegExp.exec(line);
                    if (h1match) {
                        // check if basename == match[1].md
                        if (basename !== `${h1match[1]}.md`) {
                            logger(`ID ${h1match[1]} does not match filename ${basename}`);
                            // vscode.window.showInformationMessage(`ID ${match[1]} does not match filename ${basename}`);
                        } else {
                            this.idMatch = true;
							// show the H1 header only when the ID matches the filename
                            this.label = line; 
                        }                          
                    }
                    // Regex to match markdown links, capture the ID
                    let match;
                    const linkRegex = /\[\[([\w\\.]+)\]\]/g;
                    while ((match = linkRegex.exec(line)) !== null) {
                        this.incomingLinksMap.addLink(match[1], ID); // Use the extracted ID here
                    }

                       
                }
                if (!this.idMatch) {
                    logger(`# ID TITLE not found in: ${basename}`);
                }
                // vscode.window.showInformationMessage(`# ID TITLE header not found in: ${basename}`);
                rl.close();

                // Add the set of incoming links for this file to this object
                this.incomingLinks = this.incomingLinksMap.getIncomingLinksFor(ID);
                return this;
            } catch (err) {
                console.error(err);
                return this;
            }
        })() as unknown as AsyncZettelViewTreeItem;
    }
}
