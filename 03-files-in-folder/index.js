const { readdir, stat } = require('node:fs/promises');
const { resolve } = require('node:path');
const { stdout } = process;
const { EOL } = require('os')


const getFormattedData = (name, size) => {
  const [filename, extension] = name.split('.');
  const filesize = `${(size / 1024).toFixed(3)}kb`;
  stdout.write(`${filename} - ${extension} - ${filesize}${EOL}`);
};

const getInfo = async (filename) => {
  const dirPath = resolve(__dirname, filename);
  const options = { withFileTypes: true };
  try {
    const filepaths = await readdir(dirPath, options);
    filepaths
      .filter((dirent) => dirent.isFile())
      .forEach(async ({ name }) => {
        const filepath = resolve(dirPath, name);
        const { size } = await stat(filepath);
        getFormattedData(name, size);
      });
  } catch({ message }) {
    stdout.write(`${message}${EOL}`);
  }
};

getInfo('secret-folder');
