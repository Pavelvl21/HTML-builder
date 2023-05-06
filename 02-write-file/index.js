const readline = require('node:readline');
const { stdin: input , stdout: output } = require('node:process');
const { createWriteStream } = require('fs');
const path = require('path');
const { EOL } = require('os')

const readfile = (filename) => {
  const greeting = `Hello, I am C-3PO, human cyborg relations.${EOL}Fill my memory with better words, please...${EOL}`;
  const parting = `...and taking one last look... at my friends${EOL}`;

  const rl = readline.createInterface({ input, output });
  const filepath = path.join(__dirname, filename);
  const stream = createWriteStream(filepath);

  const handleClose = () => {
    rl.close();
    output.write(parting);
  };

  const handleError = ({ message }) => {
    output.write(`${message}${EOL}`);
    rl.close();
  };

  const handleWrite = (input) => {
    const writeableInput = input.trim().toLowerCase() === 'exit' ? handleClose() : input;
    stream.write(`${writeableInput}${EOL}`);
  };

  rl.write(greeting);
  rl.on('line', handleWrite);
  rl.on('SIGINT', handleClose);
  stream.on('error', handleError);  
};

readfile('c3poMemory.txt');
