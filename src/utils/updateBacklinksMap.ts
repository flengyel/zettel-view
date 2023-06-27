import { BacklinksMap } from "./BacklinksMap";

export async function updateBacklinksMap(
    oldID: string,
    newID: string,
    backlinksMap: BacklinksMap
): Promise<void> {
    const backlinksForOldID = backlinksMap.getBacklinksFor(oldID);

    for (const sourceID of backlinksForOldID) {
        backlinksMap.addLink(newID, sourceID);
    }

    for (const sourceID of backlinksForOldID) {
        backlinksMap.removeLink(oldID, sourceID);
    }
}
