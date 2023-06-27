import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

import { IDregex } from './IDregex';
export const id = new IDregex();

import { BacklinksMap } from './BacklinksMap';
export const backlinksMap = new BacklinksMap();

import { myLogger } from './MyLogger';
export const logger = myLogger.logMsg;

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export async function replaceBacklinks(
    oldID: string,
    newID: string,
    workspaceRoot: string,
    backlinksMap: BacklinksMap
): Promise<void> {
    const dirPath = workspaceRoot;
    const backlinksForOldID = backlinksMap.getBacklinksFor(oldID);
 
    const regex = new RegExp(`\\[\\[${oldID}\\]\\]`, 'g');
 
    for (const sourceID of backlinksForOldID) {
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

