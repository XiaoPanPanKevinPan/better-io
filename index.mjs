import * as scanl from "./scanl.mjs";
import { fs, ps, path, os } from "./common.mjs";
import * as print from "./print.mjs";

const shorthand = async () => {
	const { isClosed, ...stdioShorhand } = (await scanl.createLineScanner()).shorthand();
	return {
		fs, ps, path, os,
		...scanl, // EOF, EOL, sscan, sscanf, createLineScanner
		...stdioShorhand, // getLine, scan, scanf, lineScanner
		...print // print, printl
	}
}

export { scanl, print, shorthand, fs, ps, path, os };

