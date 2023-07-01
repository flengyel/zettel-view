import { IDregex } from './IDregex';
export const id = new IDregex();

import { IncomingLinksMap } from './IncomingLinksMap';
export const incomingLinksMapMap = new IncomingLinksMap();

import { myLogger } from './MyLogger';
export const logger = myLogger.logMsg;

import { replaceIncomingLinks } from './replaceIncomingLinks';

export { updateIncomingLinksMap } from './updateIncomingLinksMap';


// A function to extract the ID from a filename
export function extractIDFromFilename(filename: string): string {
	const match = filename.match(/^(.*).md$/);
	return match ? match[1] : '';
}
  






