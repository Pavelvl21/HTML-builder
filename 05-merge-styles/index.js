const { resolve, extname, join } = require('node:path');
const {
  readdir,
  readFile,
} = require('node:fs/promises');
const { EOL } = require('os');
const { createWriteStream } = require('fs');

const { stdout } = process;

const state = {
  hasError: false,
};
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

const writeStyles = async (src, dest) => {
  const stream = createWriteStream(dest);
  const options = { withFileTypes: true };
  try {
    const components = await readdir(src, options);
    const dirents = components
      .filter((dirent) => {
        const { name } = dirent;
        return extname(name) === '.css' && dirent.isFile();
      })
      .map(async (dirent) => {
        const { name } = dirent;
        const source = resolve(src, name);
        stream.write(await readFile(source, 'utf-8'));
        const msg = await successMessage(name, state.hasError);
        stdout.write(msg);
      });
    Promise.all([dirents]);
  } catch ({ message }) {
    state.hasError = 'true';
    stdout.write(`${red}${message}${EOL}`);
  }
};

const buildBoundle = async (srcPath, boundlePath, boundleName) => {
  const src = resolve(__dirname, srcPath);
  const dest = resolve(__dirname, join(boundlePath, boundleName));
  await writeStyles(src, dest);
};

buildBoundle('styles', 'project-dist', 'bundle.css');
