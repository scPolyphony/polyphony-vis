/* eslint-disable */
import { HTTPStore, KeyError } from 'zarr';

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class ZarrDataSource {
  constructor({ url }) {
    // TODO: We should probably add a way of allowing HEAD requests as well:
    // https://github.com/gzuidhof/zarr.js/blob/375ce0c299469a970da6bb5653513564e25806bb/docs/getting-started/remote-data.md#stores
    const supportedMethods = ['GET'];
    this.store = new HTTPStore(url, {
      supportedMethods, fetchOptions: { cache: "no-store" },
    });
  }

  /**
   * Class method for decoding json from the store.
   * @param {string} key A path to the item.
   * @returns {Promise} This async function returns a promise
   * that resolves to the parsed JSON if successful.
   * @throws This may throw an error.
   */
  async getJson(key) {
    try {
      const buf = await this.store.getItem(key);
      const text = new TextDecoder('utf-8').decode(buf);
      return JSON.parse(text);
    } catch (err) {
      if (err instanceof KeyError) {
        return {};
      }
      throw err;
    }
  }
}
