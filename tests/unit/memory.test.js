const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory');

describe('API Responses', () => {
  // Write a test for calling writeFragment()
  test('writeFragment() returns a Promise', async () => {
    // test to check if writeFragment() returns a Promise
    await expect(writeFragment({ ownerId: 'a', id: 'a', value: {} })).resolves;
  });

  // Write a test for calling readFragment()
  test('readFragment() returns a Promise', async () => {
    // test to check if readFragment() returns a Promise
    await expect(readFragment('a', 'a')).resolves;
  });

  // Write a test for calling writeFragmentData()
  test('writeFragmentData() returns a Promise', async () => {
    // test to check if writeFragmentData() returns a Promise
    await expect(writeFragmentData('a', 'a', {})).resolves;
  });

  // Write a test for calling readFragmentData()
  test('readFragmentData() returns a Promise', async () => {
    // test to check if readFragmentData() returns a Promise
    await expect(readFragmentData('a', 'a')).resolves;
  });
});
