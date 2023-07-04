import { IDregex } from './IDregex';
export const idregex = new IDregex();

import { IncomingLinksMap } from './IncomingLinksMap';
export const incomingLinksMapMap = new IncomingLinksMap();

export { updateIncomingLinksMap } from './updateIncomingLinksMap';

// A function to extract the ID from a filename
export function extractIDFromFilename(filename: string): string {
    const mdExtensionRegex = /^(.*).md$/;
    const match = filename.match(mdExtensionRegex);
    return match ? match[1] : '';
}
