const readline = require('node:readline');
const { stdin: input , stdout: output } = require('node:process');
const { createWriteStream } = require('fs');
const path = require('path');


const readfile = (filename) => {
  const greeting = 'Hello, I am C-3PO, human cyborg relations.\nFill my memory with better words, please\n';
  const parting = 'Taking one last look... at my friends\n';
  const closeConsole = () => {
    rl.close();
    output.write(parting);
  };

  const rl = readline.createInterface({ input, output });
  const filepath = path.join(__dirname, filename)
  const stream = createWriteStream(filepath)
  
  rl.write(greeting);
  rl.on('line', (input) => {
    const writeableInput = input === 'exit' ? closeConsole() : input;
    stream.write(`${writeableInput}\n`);
  })
  rl.on('SIGINT', () => {
    rl.close();
    output.write(parting);
  });
};

readfile('c3poMemory.txt');
