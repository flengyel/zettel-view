import { IDregex } from './IDregex';
export const idRegex = new IDregex();

import { IncomingLinksMap } from './IncomingLinksMap';
export const incomingLinksMapMap = new IncomingLinksMap();

export { updateIncomingLinksMap } from './updateIncomingLinksMap';

// A function to extract the ID from a filename
export function extractIDFromFilename(filename: string): string {
    // match markdown file names
    const match = filename.match(idRegex.mdRegExp);
    return match ? match[1] : '';
}
