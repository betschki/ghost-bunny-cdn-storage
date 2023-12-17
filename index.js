/* eslint-disable ghost/ghost-custom/no-native-error */
/* eslint-disable max-lines */
/* eslint-disable ghost/filenames/match-exported-class */
const BaseAdapter = require('ghost-storage-base');
const fs = require('fs');

class BunnyCDNAdapter extends BaseAdapter {
  constructor(config) {
    super();

    this.options = config || {};
    this.options.endpoint =
      this.options.endpoint ||
      'https://storage.bunnycdn.com' ||
      process.env.BUNNYCDN_ENDPOINT;
    this.options.storageZone =
      this.options.storageZone || process.env.BUNNYCDN_STORAGE_ZONE;
    this.options.hostname =
      this.options.hostname || process.env.BUNNYCDN_HOSTNAME;
    this.options.accessKey =
      this.options.accessKey || process.env.BUNNYCDN_ACCESS_KEY;
    this.options.folder = this.options.folder || process.env.BUNNYCDN_FOLDER;

    this.apiHeaders = {
      AccessKey: this.options.accessKey,
    };
  }

  /**
   * Checks whether a file exists on BunnyCDN
   * @param {string} filename
   * @param {string} targetDir
   * @returns {Promise<boolean>}
   */
  async exists(filename, targetDir) {
    const files = await this.list(targetDir);
    return files.includes(filename);
  }

  /**
   * Saves a file to BunnyCDN
   * @param {object} image - Image object with 'name' and 'path' properties
   * @returns {Promise<string>} URL of the saved file
   */
  async save(image) {
    if (!this.isValidImage(image)) {
      throw new Error('Invalid image object. Image must have name and path.');
    }

    const uniqueFilename = this.generateUniqueFilename(image.name);
    const uploadUrl = this.constructBunnyCDNUrl(uniqueFilename);
    const fileStream = fs.createReadStream(image.path);

    try {
      await this.performUpload(uploadUrl, fileStream);
      return this.constructDownloadUrl(uniqueFilename);
    } catch (error) {
      throw new Error(`Error during file save operation: ${error.message}`);
    }
  }

  /**
   * Ghost calls .serve() as part of its middleware stack,
   * and mounts the returned function as the middleware for
   * serving images
   * @returns {function}
   */
  serve() {
    return function customServe(req, res, next) {
        try {
            const filename = req.path.replace(/^\//, '');
            const fileStream = this.read(filename);
            fileStream.pipe(res);
        } catch (error) {
            res.status(404)
            next(error);
        }
    };
  }

  /**
   * Deletes a file from BunnyCDN
   * @param {string} filename
   * @returns {Promise<void>}
   */
  async delete(filename) {
    try {
      await fetch(this.constructBunnyCDNUrl(filename), {
        method: 'DELETE',
        headers: this.apiHeaders,
      });
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  /**
   * Reads a file from BunnyCDN
   * @param {string} filename
   * @returns {Promise<Buffer>}
   */
  async read(filename) {
    try {
      const response = await fetch(this.constructBunnyCDNUrl(filename), {
        method: 'GET',
        headers: this.apiHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.statusText}`);
      }

      const buffer = await response.buffer();
      return buffer;
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    }
  }

  /**
   * Returns a list of files in a directory
   * @param {string} targetDir
   * @returns {Promise<string[]>}
   */
  async list(targetDir) {
    const folderPath = this.options.folder ? `/${this.options.folder}` : '';
    try {
      const response = await fetch(
        `${this.options.endpoint}/${this.options.storageZone}${folderPath}/${targetDir}`,
        {
          method: 'GET',
          headers: this.apiHeaders,
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.statusText}`);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      throw new Error(`Error fetching files: ${error.message}`);
    }
  }

  isValidImage(image) {
    return image && image.name && image.path;
  }

  generateUniqueFilename(originalName) {
    return `${Date.now()}-${originalName}`;
  }

  constructBunnyCDNUrl(filename) {
    const folderPath = this.options.folder
      ? `/${this.options.folder}/${this.getTargetDir()}`
      : this.getTargetDir();

    return `${this.options.endpoint}/${this.options.storageZone}${folderPath}/${filename}`;
  }

  constructDownloadUrl(filename) {
    const folderPath = this.options.folder
      ? `/${this.options.folder}/${this.getTargetDir()}`
      : this.getTargetDir();

    return `https://${this.options.hostname}${folderPath}/${filename}`;
  }

  /**
   * Performs the actual upload to BunnyCDN
   * @param {string} url
   * @param {fs.ReadStream} fileStream
   * @returns {Promise<Response>}
   */
  async performUpload(url, fileStream) {
    try {
      return await fetch(url, {
        method: 'PUT',
        headers: {
          ...this.apiHeaders,
          'Content-Type': 'application/octet-stream',
        },
        body: fileStream,
        duplex: 'half',
      });
    } catch (error) {
      throw new Error(`Error during upload: ${error.message}`);
    }
  }
}

module.exports = BunnyCDNAdapter;
