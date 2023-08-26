import * as scanl from "./scanl.mjs";
import { fs, ps, path, os } from "./common.mjs";
import * as print from "./print.mjs";

const shorthand = async (obj) => {
	const { isEof: lsIsEof, isEmpty: lsIsEmpty, close: lsClose, ...stdioShorhand } = (await scanl.createLineScanner()).shorthand();
	const result =  {
		fs, ps, path, os,
		...scanl, // EOF, EOL, sscan, sscanf, createLineScanner
		lsIsEof, lsIsEmpty, lsClose, ...stdioShorhand, // getLine, scan, scanf, lineScanner
		...print // print, printl
	}
	if(obj instanceof Object)
		Object.assign(obj, result);
	return result;
}

export { scanl, print, shorthand, fs, ps, path, os };

