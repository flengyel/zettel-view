import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

import { IDregex } from './IDregex';
export const id = new IDregex();

import { IncomingLinksMap } from './IncomingLinksMap';
export const incomingLinksMap = new IncomingLinksMap();

import { MyLogger } from './MyLogger';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export async function replaceIncomingLinks(oldID: string, newID: string, workspaceRoot: string, incomingLinksMap: IncomingLinksMap) {
    // Get a set of source files which have links to the oldID
    const incomingLinks = incomingLinksMap.getIncomingLinksFor(oldID);

    // Loop through each file and replace all occurrences of oldID with newID
    for (const sourceID of incomingLinks) {
        const sourceFilePath = path.join(workspaceRoot, `${sourceID}.md`);
        const content = await fs.promises.readFile(sourceFilePath, 'utf-8');
        const updatedContent = content.split(`[[${oldID}]]`).join(`[[${newID}]]`);
        await fs.promises.writeFile(sourceFilePath, updatedContent, 'utf-8');

        // Update the IncomingLinksMap to reflect the change in ID
        incomingLinksMap.removeLink(sourceID, oldID);
        incomingLinksMap.addLink(sourceID, newID);
    }
}
