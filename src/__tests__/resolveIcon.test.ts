import { resolveIconUri } from '../resolveIcon';

describe('resolveIconUri', () => {
  it('returns undefined when no icon is given', async () => {
    expect(await resolveIconUri(undefined)).toBeUndefined();
  });

  it('passes a URI object through', async () => {
    expect(await resolveIconUri({ uri: 'https://example.com/icon.png' })).toBe(
      'https://example.com/icon.png'
    );
  });

  it('treats an empty URI as no icon', async () => {
    expect(await resolveIconUri({ uri: '' })).toBeUndefined();
  });
});
