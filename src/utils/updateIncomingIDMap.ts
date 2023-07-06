import { IncomingIDMap } from "./IncomingIDMap";

export async function updateIncomingIDMap(
    oldID: string,
    newID: string,
    incomingIDMap: IncomingIDMap
): Promise<void> {
    const incomingIDsForOldID = incomingIDMap.getIncomingIDsFor(oldID);

    for (const sourceID of incomingIDsForOldID) {
        incomingIDMap.addID(newID, sourceID);
        incomingIDMap.removeID(oldID, sourceID);
    }
}


