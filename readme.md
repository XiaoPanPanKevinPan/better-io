# Boost - Coding Speed Booster for NodeJS
This project aims to boost the coding speed in NodeJS. It's developed for competitive programming and is still under development.

## Install
To install this package, you can run this in your shell:
```bash
npm install @xppkp/boost 
# You can also run
npm install https://github.com/XiaoPanPanKevinPan/boost
```

## Import
After installing, you can write this in your script:
```js 
import * as boost from "boost";
```

To prevent verbose importing, you can use the shorthand:
```js 
import * as boost from "boost";
const { scanf, EOF, ps, print, printl } = await boost.shorthand();
```

## Usage
The best usage is:
```js
import * as boost from "@xppkp/boost"
const { scanf, printl, lsClose, lsIsEof } = await boost.shorthand();
while(!lsIsEof()) {
	const [x, y] = await scanf("%d %d");
	printl(`${x} + ${y} = ${x + y}`);
}
lsClose();
```

For more, see [this]( ./usage.md ).
