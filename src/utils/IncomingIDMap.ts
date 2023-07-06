export class IncomingIDMap {
    private incomingIDs: Map<string, Set<string>>;

    constructor() {
        this.incomingIDs = new Map<string, Set<string>>();
    }

    addID(sourceID: string, targetID: string) {
        if (!this.incomingIDs.has(targetID)) {
            this.incomingIDs.set(targetID, new Set<string>());
        }

        this.incomingIDs.get(targetID)?.add(sourceID);
    }

    removeID(sourceID: string, targetID: string) {
        const incomingIDsForTarget = this.incomingIDs.get(targetID);
        if (incomingIDsForTarget) {
            incomingIDsForTarget.delete(sourceID);
            
            if (incomingIDsForTarget.size === 0) {
                this.incomingIDs.delete(targetID);
            }
        }
    }

    getIncomingIDsFor(targetID: string): Set<string> {
        return this.incomingIDs.get(targetID) || new Set<string>();
    }

    // And so on 
}

export const incomingIDMap = new IncomingIDMap(); 