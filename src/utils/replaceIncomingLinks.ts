import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

import { IDregex } from './IDregex';
export const id = new IDregex();

import { IncomingLinksMap } from './IncomingLinksMap';
export const incomingLinksMap = new IncomingLinksMap();

import { myLogger } from './MyLogger';
export const logger = myLogger.logMsg;

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export async function replaceIncomingLinks(
    oldID: string,
    newID: string,
    workspaceRoot: string,
    incomingLinksMap: IncomingLinksMap
): Promise<void> {
    const dirPath = workspaceRoot;
    const incomingLinksForOldID = incomingLinksMap.getIncomingLinksFor(oldID);
 
    const regex = new RegExp(`\\[\\[${oldID}\\]\\]`, 'g');
 
    for (const sourceID of incomingLinksForOldID) {
        const filePath = path.join(dirPath, `${sourceID}.md`);

        try {
            const content = await readFile(filePath, 'utf-8');

            const newContent = content.replace(regex, `[[${newID}]]`);

            await writeFile(filePath, newContent, 'utf-8');
        } catch (error) {
            myLogger.logMsg(`Error replacing links in file ${filePath}: ${error}`);
        }
    }
}

