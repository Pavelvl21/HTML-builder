const readline = require('node:readline');
const { stdin: input , stdout: output } = require('node:process');
const { createWriteStream } = require('fs');
const path = require('path');

const readfile = (filename) => {
  const greeting = 'Hello, I am C-3PO, human cyborg relations.\nFill my memory with better words, please...\n';
  const parting = '...and taking one last look... at my friends\n';

  const rl = readline.createInterface({ input, output });
  const filepath = path.join(__dirname, filename);
  const stream = createWriteStream(filepath);

  const handleClose = () => {
    rl.close();
    output.write(parting);
  };

  const handleError = ({ message }) => {
    output.write(`${message}\n`);
    rl.close();
  };

  const handleWrite = (input) => {
    const writeableInput = input.trim().toLowerCase() === 'exit' ? handleClose() : input;
    stream.write(`${writeableInput}\n`);
  };

  rl.write(greeting);
  rl.on('line', handleWrite);
  rl.on('SIGINT', handleClose);
  stream.on('error', handleError);  
};

readfile('c3poMemory.txt');
