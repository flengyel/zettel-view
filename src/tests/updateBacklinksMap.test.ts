import { expect } from 'chai';
import { IncomingLinksMap } from '../utils/IncomingLinksMap';
import { updateIncomingLinksMap } from '../utils/updateIncomingLinksMap';


describe('updateBacklinksMap', () => {
  let map: IncomingLinksMap;

  beforeEach(() => {
    map = new IncomingLinksMap();
  });

  it('should update the incoming links map correctly', async () => {
    map.addLink('oldID', 'sourceID');
    await updateIncomingLinksMap('oldID', 'newID', map);
    expect(map.getIncomingLinksFor('sourceID')).to.include('newID');
    expect(map.getIncomingLinksFor('sourceID')).to.not.include('oldID');
  });

  // Add more tests as needed...
});
