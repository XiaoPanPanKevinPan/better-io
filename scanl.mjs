import readline from "node:readline";
import fs from "node:fs";
import ps from "node:process";
import { EventEmitter } from "node:events";

const EOL = Symbol.for("EOL");

const sscan = (line, splitter = /[ \r\n]+/) => line.split(splitter).filter(x => x);
const sscanf = (line, format, { allowLengthUnmet = false, extendedSpec = {}, splitter } = {}) => {
	const table = {
		"%s": str => str,
		"%d": str => parseInt(str),
		"%f": str => parseFloat(str),
		"%x": str => parseInt(str, 16),
		"%o": str => parseInt(str, 8),
		...extendedSpec
	};

	const substrs = sscan(line, splitter);
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

		rl.once("close", () => {
			this.#closed = true;
			this.emit("close");
		});

		if(rl.closed) {
			this.#closed = true;
			this.emit("close");
		}

		// "close" event doesn't mean the #unprocessedLines is empty
	}

	readline = null; // inited and made constant in constructor

	close() { 
		this.readline.close();
	}

	#closed = false;

	#unprocessedLines = [];
	isEmpty() {
		return this.#unprocessedLines.length == 0
	}

	isEof() {
		return this.#closed && this.isEmpty();
	}

	async getLine() {
		if(this.#unprocessedLines.length > 0)
			return (this.#unprocessedLines).shift();
		if(this.#closed) 
			return EOF;
		return new Promise(res => {
			const lineReadyCb = () => {
				clearListeners();
				res(this.#unprocessedLines.shift() ?? this.getLine());
					// If there are two getLine() waiting, one can consume a line, but the other will get undefined.
					// This automatically makes it wait for another line.
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

	async scan(splitter) {
		const line = await this.getLine();
		if(line == EOF) return [ EOF ];
		return sscan(line, splitter);
	};

	async scanf(format, options) {
		const line = await this.getLine();
		if(line == EOF) return [ EOF ];
		return sscanf(line, format, options);
	}

	shorthand (obj) {
		const result = { lineScanner: this };
		["getLine", "scan", "scanf", "close", "isEmpty", "isEof"].forEach(x => {
			// result[x] = (...val) => this[x](...val);
			result[x] = this[x].bind(this)
		});
		if(obj instanceof Object) 
			Object.assign(obj, result);
		return result;
	}
}

const createLineScanner = async () => {
	return new LineScanner(await readline.createInterface({ input: ps.stdin }));
}

export { sscan, sscanf, EOL, LineScanner, EOF, createLineScanner };
