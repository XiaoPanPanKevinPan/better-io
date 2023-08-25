import { stdout } from "node:process";
import { EOL as linebreak } from "node:os";
const print = (...x) => stdout.write(x.map(v => `${v}`).join(' '));
const printl = (...x) => stdout.write(x.map(v => `${v}`).join(' ') + linebreak);

export { print, printl }

