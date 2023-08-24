import * as scanl from "./scanl.mjs";

const shorthand = async () => {
	const stdioShorhand = (await scanl.createLineScanner()).shorthand();
	delete stdioShorhand.isClosed();
	return {
		...scanl, // EOF, EOL, sscan, sscanf, createLineScanner
		...stdioShorhand // getLine, scan, scanf
	}
}

export { scanl, shorthand };

