import readline from "node:readline";
import fs from "node:fs";
import ps from "node:process";
import { EventEmitter } from "node:events";

const EOL = Symbol.for("EOL");

const sscan = line => line.split(/ +/);
const sscanf = (line, format, { allowLengthUnmet = false, extendedSpec = {} } = {}) => {
	const table = {
		"%s": str => str,
		"%d": str => parseInt(str),
		"%f": str => parseFloat(str),
		"%x": str => parseInt(str, 16),
		"%o": str => parseInt(str, 8),
		...extendedSpec
	};

	const substrs = sscan(line);
	const specs = format.split(/[ \r\n]+|(?=%)/);
	if(!allowLengthUnmet && substrs.length != specs.length)
		throw "Lengthes unmet!";

	const processed = substrs.map((str, idx) => {
		const spec = specs[idx];
		if(!spec) // i.e., specs.length < substrs.length 
			return str; // just use the original str 

		const specProcessor = table[spec] 
			|| Object.entires(table)
				.find(([key]) => str.match(key))?.[1];

		if(!specProcessor) // not a valid specifier
			throw `Undefined spec "${spec}" when processing string "${str}"`; 

		return specProcessor(str, spec);
	});

	return [...processed, ...Array(Math.max(processed.length - substrs.length, 0)).fill(EOL)]
		// if processed.length > substr.length, fill the rest with Symbol(EOL)
}

const EOF = Symbol.for("EOF");
class LineScanner extends EventEmitter {
	constructor(rl) {
		super();

		Object.defineProperty(this, "readline", { value: rl });

		rl.on("line", line => {
			this.#unprocessedLines.push(line);
			this.emit("lineReady");
		});

		rl.on("close", () => {
			this.#closed = true;
			this.emit("close");
		})
	}

	#closed = false;
	get closed() { return this.#closed };
	isClosed() { return this.#closed };

	readline = null; // inited and made constant in constructor

	#unprocessedLines = [];
	get unprocessedLines() { return this.#unprocessedLines; }

	async getLine() {
		if(this.#unprocessedLines.length > 0)
			return (this.#unprocessedLines).shift();
		if(this.closed) 
			return EOF;
		return new Promise(res => {
			const lineReadyCb = () => {
				clearListeners();
				res(this.#unprocessedLines.shift());
			}
			const closeCb = () => {
				clearListeners();
				res(EOF);
			}
			const clearListeners = () => {
				this.removeListener("close", closeCb);
				this.removeListener("lineReady", lineReadyCb);
			}
			this.once("close", closeCb);
			this.once("lineReady", lineReadyCb);
		});
	};

	async scan() {
		const line = await this.getLine();
		if(line == EOF) return [ EOF ];
		return sscan(line);
	};

	async scanf(format, options) {
		const line = await this.getLine();
		if(line == EOF) return [ EOF ];
		return sscanf(line, format, options);
	}

	shorthand () {
		const result = { lineScanner: this };
		["isClosed", "getLine", "scan", "scanf"].forEach(x => {
			result[x] = (...val) => this[x](...val);
		})
		return result;
	}
}

const createLineScanner = async () => {
	return new LineScanner(await readline.createInterface({ input: ps.stdin }));
}

export { sscan, sscanf, EOL, LineScanner, EOF, createLineScanner };
