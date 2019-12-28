const fs = require('fs');
const path = require('path');

export default class Files {
  static getDir = () : string => {
    return path.basename(process.cwd());
  }

  static isDir = async (filePath) : Promise<boolean> => {
    return await fs.existsSync(filePath);
  }

  static createDir = async (path) => {
      return await fs.mkdirSync(path);
  }

  static readDir = async (filePath) : Promise <string> | null => {
    if (!filePath) return null;
    try {
        return await fs.readdirSync(filePath);
        // return await path.basename(path.dirname(fs.realpathSync(__filename)));
    } catch(e) {
        throw new Error((e || {message: e}).message);
    }
  }
};