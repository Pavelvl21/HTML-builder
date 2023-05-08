const { resolve, extname, join } = require('node:path');
const {
  readdir,
  readFile,
  copyFile,
  mkdir,
  rm,
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

const writeHtml = async (src, dest, template) => {
  const stream = createWriteStream(resolve(dest, 'index.html'));
  const templateFile = await readFile(template, 'utf-8');

  let formattedTemplate = templateFile;
  const options = { withFileTypes: true };

  try {
    const components = await readdir(src, options);
    const dirents = components
      .filter((dirent) => {
        const { name } = dirent;
        return extname(name) === '.html' && dirent.isFile();
      })
      .map(async ({ name }) => {
        const componentsPath = resolve(__dirname, 'components');
        const targetPath = resolve(componentsPath, name);
        const component = await readFile(targetPath, 'utf-8');
        const componentName = name.slice(0, name.indexOf('.'));
        formattedTemplate = formattedTemplate.replace(`{{${componentName}}}`, component);
        if (!formattedTemplate.match(/{{(.*)}}/gi)) {
          stream.write(formattedTemplate);
        }
        const msg = await successMessage(name, state.hasError);
        stdout.write(msg);
      });
    Promise.all([dirents]);
  } catch ({ message }) {
    state.hasError = 'true';
    stdout.write(`${red}${message}${EOL}`);
  }
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

const copyDir = async (srcName, boundlePath) => {
  const src = resolve(__dirname, srcName);
  const dest = resolve(boundlePath, srcName);
  await copyFiles(src, dest);
};

const buildCssBoundle = async (srcName, boundlePath) => {
  const src = resolve(__dirname, srcName);
  const dest = resolve(__dirname, join(boundlePath, 'style.css'));
  await writeStyles(src, dest);
};

const buildHtmlBundle = async (srcName, dest, templateName) => {
  const src = resolve(__dirname, srcName);
  const template = resolve(__dirname, templateName);
  await writeHtml(src, dest, template);
};

const app = async () => {
  const dest = resolve(__dirname, 'project-dist');
  try {
    await rm(dest, { recursive: true, force: true });
    await mkdir(dest, { recursive: true });
  } catch ({ message }) {
    state.hasError = 'true';
    stdout.write(`${red}${message}${EOL}`);
  }
  await buildHtmlBundle('components', dest, 'template.html');
  await buildCssBoundle('styles', dest);
  await copyDir('assets', dest);
};

app();
