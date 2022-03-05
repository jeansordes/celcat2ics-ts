import dotenv from 'dotenv-placeholder';
dotenv.config({ path: __dirname + '/../.env' });

const output: string = 'Hello ' + process.env.HELLO;

console.log(output);