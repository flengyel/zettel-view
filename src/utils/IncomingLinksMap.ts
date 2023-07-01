

export class IncomingLinksMap {
    private incominglinks: Map<string, Set<string>>;

    constructor() {
        this.incominglinks = new Map<string, Set<string>>();
    }

    addLink(sourceID: string, targetID: string) {
        let incominglinksForTarget = this.incominglinks.get(targetID);
        if (!incominglinksForTarget) {
            incominglinksForTarget = new Set<string>();
            this.incominglinks.set(targetID, incominglinksForTarget);
        }
        incominglinksForTarget.add(sourceID);
    }

    removeLink(sourceID: string, targetID: string) {
        const incominglinksForTarget = this.incominglinks.get(targetID);
        if (incominglinksForTarget) {
            incominglinksForTarget.delete(sourceID);
            if (incominglinksForTarget.size === 0) {
                this.incominglinks.delete(targetID);
            }
        }
    }

    getIncomingLinksFor(targetID: string): Set<string> {
        return this.incominglinks.get(targetID) || new Set<string>();
    }

    // And so on 
}


