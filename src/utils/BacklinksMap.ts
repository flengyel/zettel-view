

export class BacklinksMap {
    private backlinks: Map<string, Set<string>>;

    constructor() {
        this.backlinks = new Map<string, Set<string>>();
    }

    addLink(sourceID: string, targetID: string) {
        let backlinksForTarget = this.backlinks.get(targetID);
        if (!backlinksForTarget) {
            backlinksForTarget = new Set<string>();
            this.backlinks.set(targetID, backlinksForTarget);
        }
        backlinksForTarget.add(sourceID);
    }

    removeLink(sourceID: string, targetID: string) {
        const backlinksForTarget = this.backlinks.get(targetID);
        if (backlinksForTarget) {
            backlinksForTarget.delete(sourceID);
            if (backlinksForTarget.size === 0) {
                this.backlinks.delete(targetID);
            }
        }
    }

    getBacklinksFor(targetID: string): Set<string> {
        return this.backlinks.get(targetID) || new Set<string>();
    }

    // And so on 
}


