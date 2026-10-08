const assert = require('node:assert');
const { mediaIdFromUrl, videosFrom } = require('./background.js');

assert.equal(mediaIdFromUrl('https://www.instagram.com/p/B/'), '1');
assert.equal(mediaIdFromUrl('https://www.instagram.com/reel/BA/?igsh=x'), '64');
assert.equal(mediaIdFromUrl('https://www.instagram.com/nasa/reel/_/'), '63');
assert.equal(mediaIdFromUrl('https://www.instagram.com/stories/nasa/3141592653589793238/'), '3141592653589793238');
assert.equal(mediaIdFromUrl('https://www.instagram.com/explore/'), null);

const carousel = { items: [{ code: 'abc', user: { username: 'u' }, carousel_media: [
  { video_versions: [{ width: 480, url: 'lo' }, { width: 1080, url: 'hi' }] },
  { image_versions2: {} },
] }] };
assert.deepEqual(videosFrom(carousel), [{ url: 'hi', filename: 'instagram/u_abc_1.mp4' }]);
assert.deepEqual(videosFrom({ items: [] }), []);

console.log('ok');
