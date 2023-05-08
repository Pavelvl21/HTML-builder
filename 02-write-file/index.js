const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const { createWriteStream } = require('fs');
const { resolve } = require('node:path');
const { EOL } = require('os');

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

const readfile = (filename) => {
  const greeting = `Hello, I am ${yellow}C-3PO${reset}, human cyborg relations.${EOL}Fill my memory with better words, please...${EOL}`;
  const parting = `${green}...and taking one last look... at my friends${reset}${EOL}`;

  const rl = readline.createInterface({ input, output });
  const filepath = resolve(__dirname, filename);
  const stream = createWriteStream(filepath);

  const handleClose = () => {
    rl.close();
    output.write(parting);
  };

  const handleError = ({ message }) => {
    output.write(`${message}${EOL}`);
    rl.close();
  };

  const handleWrite = (inputText) => {
    const writeableInput = inputText.trim().toLowerCase() === 'exit' ? handleClose() : inputText;
    stream.write(`${writeableInput}${EOL}`);
  };

  rl.write(greeting);
  rl.on('line', handleWrite);
  rl.on('SIGINT', handleClose);
  stream.on('error', handleError);
};

readfile('c3poMemory.txt');
