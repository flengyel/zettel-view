import { IncomingLinksMap } from "./IncomingLinksMap";

export async function updateIncomingLinksMap(
    oldID: string,
    newID: string,
    incomingLinksMap: IncomingLinksMap
): Promise<void> {
    const incomingLinksForOldID = incomingLinksMap.getIncomingLinksFor(oldID);

    for (const sourceID of incomingLinksForOldID) {
        incomingLinksMap.addLink(newID, sourceID);
        incomingLinksMap.removeLink(oldID, sourceID);
    }
}


