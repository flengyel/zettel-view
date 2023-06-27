import { expect } from 'chai';
import { updateBacklinksMap } from '../utils/updateBacklinksMap';

describe('updateBacklinksMap', () => {
  let map: BacklinksMap;

  beforeEach(() => {
    map = new BacklinksMap();
  });

  it('should update the backlinks map correctly', async () => {
    map.addLink('oldID', 'sourceID');
    await updateBacklinksMap('oldID', 'newID', map);
    expect(map.getBacklinksFor('sourceID')).to.include('newID');
    expect(map.getBacklinksFor('sourceID')).to.not.include('oldID');
  });

  // Add more tests as needed...
});
