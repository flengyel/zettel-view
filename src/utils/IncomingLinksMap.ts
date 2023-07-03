export class IncomingLinksMap {
    private incomingLinks: Map<string, Set<string>>;

    constructor() {
        this.incomingLinks = new Map<string, Set<string>>();
    }

    addLink(sourceID: string, targetID: string) {
        if (!this.incomingLinks.has(targetID)) {
            this.incomingLinks.set(targetID, new Set<string>());
        }

        this.incomingLinks.get(targetID)?.add(sourceID);
    }

    removeLink(sourceID: string, targetID: string) {
        const incomingLinksForTarget = this.incomingLinks.get(targetID);
        if (incomingLinksForTarget) {
            incomingLinksForTarget.delete(sourceID);
            
            if (incomingLinksForTarget.size === 0) {
                this.incomingLinks.delete(targetID);
            }
        }
    }

    getIncomingLinksFor(targetID: string): Set<string> {
        return this.incomingLinks.get(targetID) || new Set<string>();
    }

    // And so on 
}
