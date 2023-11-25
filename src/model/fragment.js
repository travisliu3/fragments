// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const logger = require('../logger');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!type || !ownerId) {
      throw new Error(`type and ownerId strings are required`);
    } else {
      this.ownerId = ownerId;
      if (Fragment.isSupportedType(type)) {
        this.type = type;
      } else {
        throw new Error(`type value is invalid`);
      }
    }

    if (typeof size !== 'number' || isNaN(size)) {
      throw new Error(`size must be a number strictly`);
    } else if (size < 0) {
      throw new Error(`size must not be negative`);
    } else {
      this.size = size;
    }

    if (id) {
      this.id = id;
    } else {
      this.id = randomUUID({ disableEntropyCache: true });
    }

    if (created) {
      this.created = created;
    } else {
      this.created = new Date();
    }

    if (updated) {
      this.updated = updated;
    } else {
      this.updated = new Date();
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    return readFragment(ownerId, id).then((fragment) => {
      if (fragment) {
        return fragment;
      } else {
        logger.error('No fragment is found');
        throw new Promise.reject('No fragment found');
      }
    });
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date();
    writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!data) {
      throw new Promise.reject('Empty Buffer');
    }
    logger.info('data is Buffer');
    this.size = data.length;
    this.updated = new Date();
    await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return typeof this.type === 'string';
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return ['text/plain'];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const supportedTypes = ['text/', 'application/json'];
    return supportedTypes.some((type) => value.includes(type));
  }
}

module.exports.Fragment = Fragment;
