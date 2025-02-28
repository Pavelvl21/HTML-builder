const { createReadStream } = require('fs');
const { resolve } = require('node:path');

const { stdout } = process;
const { EOL } = require('os');

const readFile = (filename) => {
  const filepath = resolve(__dirname, filename);
  const stream = createReadStream(filepath, 'utf-8');

  stream.on('data', (chunk) => stdout.write(chunk));
  stream.on('error', ({ message }) => stdout.write(`${message}${EOL}`));
};

readFile('text.txt');
