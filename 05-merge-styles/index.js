const { resolve, extname, join } = require('node:path');
const {
  readdir,
  readFile,
} = require('node:fs/promises');
const { EOL } = require('os');
const { createWriteStream } = require('fs');

const { stdout } = process;

const successMessage = (name, hasError) => new Promise((res) => {
  const message = !hasError
    ? `\x1b[4m${name}\x1b[0m:\x1b[32m\tok!\x1b[0m${EOL}`
    : `${name}: FAILED!${EOL}`;
  res(message);
});

const state = {
  hasError: false,
};

const writeStyles = async (src, dest) => {
  const stream = createWriteStream(dest);
  const options = { withFileTypes: true };
  try {
    const dirents = await readdir(src, options);
    if (dirents.length !== 0) {
      dirents.filter((dirent) => {
        const { name } = dirent;
        return extname(name) === '.css' || dirent.isDirectory();
      })
        .forEach(async (dirent) => {
          const { name } = dirent;
          const source = resolve(src, name);

          const promise = dirent.isFile()
            ? stream.write(await readFile(source, 'utf-8'))
            : await writeStyles(source, dest);
          Promise.all([promise]);

          const msg = await successMessage(name, state.hasError);
          stdout.write(msg);
        });
    }
  } catch ({ message }) {
    state.hasError = 'true';
    stdout.write(`\x1b[31m${message}${EOL}`);
  }
};

const buildBoundle = async (srcPath, boundlePath, boundleName) => {
  const src = resolve(__dirname, srcPath);
  const dest = resolve(__dirname, join(boundlePath, boundleName));
  await writeStyles(src, dest);
};

buildBoundle('styles', 'project-dist', 'bundle.css');
