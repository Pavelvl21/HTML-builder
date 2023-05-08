const { resolve } = require('node:path');
const {
  readdir,
  copyFile,
  mkdir,
  rm,
} = require('node:fs/promises');
const { EOL } = require('os');

const { stdout } = process;

const colors = {
  reset: '\x1b[0m',
  underscore: '\x1b[4m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  tab: '\t',
};

const {
  reset,
  underscore,
  green,
  red,
  tab,
} = colors;

const successMessage = (name, hasError) => new Promise((res) => {
  const message = !hasError
    ? `${underscore}${name}${reset}:${green}${tab}ok!${reset}${EOL}`
    : `${name}: FAILED!${EOL}`;
  res(message);
});

const state = {
  hasError: false,
};

const copyFiles = async (src, dest) => {
  const options = { withFileTypes: true };
  try {
    const dirents = await readdir(src, options);
    const destPath = await mkdir(dest, { recursive: true });
    if (dirents.length === 0) {
      await mkdir(destPath, { recursive: true });
    }
    dirents.forEach(async (dirent) => {
      const { name } = dirent;
      const source = resolve(src, name);
      const destination = resolve(destPath, name);
      const promise = dirent.isFile()
        ? await copyFile(source, destination)
        : await copyFiles(source, destination);
      Promise.all([promise]);

      const msg = await successMessage(name, state.hasError);
      stdout.write(msg);
    });
  } catch ({ message }) {
    state.hasError = 'true';
    stdout.write(`${red}${message}${EOL}`);
  }
};

const copyDir = async (dirname) => {
  const src = resolve(__dirname, dirname);
  const dest = resolve(__dirname, `${dirname}-copy`);

  try {
    await rm(dest, { recursive: true, force: true });
    await copyFiles(src, dest);
  } catch ({ message }) {
    state.hasError = 'true';
    stdout.write(`${red}${message}${EOL}`);
  }
};

copyDir('files');
