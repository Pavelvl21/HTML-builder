const { resolve } = require('node:path');
const {
  readdir,
  copyFile,
  mkdir,
  rm,
} = require('node:fs/promises');
const { EOL } = require('os');

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

const copyFiles = async (dirent, dest) => {
  const options = { withFileTypes: true };
  try {
    const direntPath = await readdir(dirent, options);
    const destPath = await mkdir(dest, { recursive: true });
    if (direntPath.length === 0) {
      await mkdir(destPath, { recursive: true });
    }
    direntPath.forEach(async (data) => {
      const { name } = data;
      const src = resolve(dirent, name);
      const copySrc = resolve(destPath, name);
      const promise = data.isFile()
        ? await copyFile(src, copySrc)
        : await copyFiles(src, copySrc);
      Promise.all([promise]);

      const msg = await successMessage(name, state.hasError);
      stdout.write(msg);
    });
  } catch ({ message }) {
    state.hasError = 'true';
    stdout.write(`\x1b[31m${message}${EOL}`);
  }
};

const copyDir = async (dirname) => {
  const dirent = resolve(__dirname, dirname);
  const dest = resolve(__dirname, `${dirname}-copy`);

  await rm(dest, { recursive: true, force: true });
  await copyFiles(dirent, dest);
};

copyDir('files');
