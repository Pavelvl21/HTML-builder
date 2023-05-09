const { readdir, stat } = require('node:fs/promises');
const { resolve, extname } = require('node:path');
const { EOL } = require('os');

const { stdout } = process;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

const {
  reset,
  green,
  yellow,
} = colors;

const getFormattedData = (name, size) => {
  const ext = extname(name);
  const filename = name.replace(ext, '');
  const filesize = `${yellow}${size}${reset}${green}B${reset}`;
  stdout.write(`${filename} - ${ext} - ${filesize}${EOL}`);
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
  } catch ({ message }) {
    stdout.write(`${message}${EOL}`);
  }
};

getInfo('secret-folder');
