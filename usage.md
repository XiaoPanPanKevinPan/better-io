# Module "@xppkp/boost" <a id="module-boost"></a>
This reference assumes the users import this module with such code:
```js
import * as boost from "@xppkp/boost"; // or
import * as boost from "@xppkp/boost/index.mjs";
```

## (async) boost.shorthand() <a id="boost-shorthand"></a>
This function generates an object with the often-used object and functions as the properties.

If you provides an object for the parameter `obj`, those properties will be assigned onto it, too. But the return value will not change.

It secrely calls [scanl.createLineScanner()]( #scanl-createLineScanner ), and calls the [scanl.LineScanner]( #scanl-LineScanner )'s [`.shorthand()`]( #scanl-LineScanner-prototype-shorthand ), then destructs and renames the properties of the returned object. Therefore, remember to call `lsClose()` property at the end of your code.

### Syntax
```js
boost.shorthand();
boost.shorthand(obj);
```

### Parameters
- `obj`
	An object that the properties, which are the often-used objects and functions, will be assigned to.

### Return Value
A promise that fulfills to an object containing these properties:
- `fs`
	A [module namespace object]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object ) that's generated from `import * as fs from "node:fs"`.
- `ps`
	Similar to the above, but it's `"node:process"`.
- `os`
	Similar to the above, but it's `"node:os"`.
- `path`
	Similar to the above, but it's `"node:path"`.
- `EOF`, `EOL`, `sscan`, `sscanf`, `createLineScanner`
	The properties of the [scanl submodule]( #submodule-scanl ).
- `getLine`, `scan`, `scanf`, `lineScanner`, `lsIsEmpty`, `lsIsEof`, `lsClose`
	The properties of the fulfillment value of the promise that's returned by `scanl.createLineScanner().shorthand()`. Please refer to [scanl.createLineScanner]( #scanl-createLineScanner ) and [scanl.lineScanner.prototype.shorthand()]( #scanl-LineScanner-prototype-shorthand ). The original property name of `lsIsEmpty` is `isEmpty`, that of `lsClose` is `close`, and that of `lsIsEof` is `isEof`, where "ls" is short for "lineScanner".
- `print`, `printl`
	The properties of the [print submodule]( #submodule-print ).

### Examples

#### Destructing Assignment
To gain access to `fs`, `ps`, `EOF`, `scanf`, `getLine`, `print`, `printl`, and `lsClose` easily:
```js
{ fs, ps, EOF, scanf, getLine, print, printl, lsClose } = await boost.shorthand();
```

#### `globalThis` Assignment
This isn't thought of as the best practice, but it may be useful in time-crucial circumstances.
```js 
Object.assign(globalThis, await boost.shorthand());
```

## boost.fs, ~.ps, ~.path, ~.os, ~.scanl, ~.printl <a id="boost-fs-ps-path-os-scanl-printl">
Each of them is a [module namespace object]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object ) that's generated from `import * as NAME from "MODULE_NAME"`. The MODULE\_NAMEs for `.fs`, `.ps`, `.path`, `.os`, `scanl`, and `printl` are `fs`, `process`, `path`, `os`, `@xppkp/boost/scanl.mjs`, and `@xppkp/boost/printl.mjs` respectively.

### Value
A promise that resolves to a [module namespace object]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object ).

### Examples
To import fs, you can:
```
import { fs } from "@xppkp/boost"; 

// or
import * as boost from "@xppkp/boost";
const fs = boost.fs;
```

# Submodule "@xppkp/boost/scanl.mjs" <a id="submodule-scanl"></a>
This (sub)module is to create an easy-to-use line-by-line auto-type-converting stdin reader.

This reference assumes the users import this module with such code:
```js
import * as scanl from "@xppkp/boost/scanl.mjs";
```

## scanl.EOL <a id="scanl-EOL"></a>
In the return value of [`scanl.sscanf()`]( #scanl-sscanf ) and [`scanl.LineScanner.prototype.scanf()`]( #scanl-LineScanner-prototype-scanf ), this symbol indicates that after the `line` argument was splitted, the length of it is less than the length of the `format` argument's slices.
 
### Value
A Symbol. It's a stored value from a previous call to `Symbol.for("EOF")`.

## scanl.EOF <a id="scanl-EOF"></a>
If this is return by/in a LineScanner instance's `getLine()`, `scan()`, or `scanf()` methods, then it indicates that the LineScanner instance has reached the end of the readline - the readline instance is closed, and there is no any unconsumed lines left.
 
### Value
A Symbol. It's a stored value from a previous call to `Symbol.for("EOF")`.

## scanl.sscan() <a id="scanl-sscan"></a>
Scan a line of string, split them by spaces, and clear the empty strings from the input. Calling `scanl.sscan(str)` is essentially the same as `str.split(/[ \r\n]+/).filter()`.

### Syntax
```js
sscan(str);
sscan(str, splitter);
```

### Parameters
- `str`
	The string to be splitted.
- `splitter` (Optional)
	A string or RegExp that's used to separate the string into pieces, default to `/[ \r\n+]+/`. See the definition of the `separator` parameter in [the parameter section]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split#parameters ) in String.prototype.split() section.

### Return Value
An array of strings.

### Examples
```js
sscan("   Hello  world! "); // ["Hello", "world!"]
```

## scanl.sscanf() <a id="scanl-sscanf"></a>
Extract strings, and convert them into specified formats.

This function secretly extracts the strings by calling `scanl.sscan()`

### Syntax
```js
sscanf(line, format);
sscanf(line, format, options);
```

### Parameters
- `line`
	The string to be splitted into slices. 
- `format`
	The string contains the specifiers. Spaces are omitted. This is a list of specifiers and the process it represents.
	- `%s`: Do nothing.
	- `%d`: Call `parseInt(slice)`.
	- `%f`: Call `parseFloat(slice)`.
	- `%o`: Call `parseFloat(slice, 8)`.
	- `%x`: Call `parseFloat(slice, 16)`.
- `options` (optional)
	An object that may contain these properties:
	- `allowLengthUnmet` (optional)
		A boolean to decide whether throw error when the length of slice array isn't equal to the length of specifiers provided. Default to `false`. If it's `true` and if slices are more than specifiers, omit the redundant slices; if slices are less, make up the array with [`scanl.EOL`]( #scanl-EOL ) at the end.
	- `extendedSpec` (optional)
		An object containing other customized specs. For each entry, the key is the customized specifier (started with `%` sign), and the value is a callback function that takes two arguments: 
		- The first argument is the slice of string to be processed.
		- The second argument is the specifier that's extracted from the `format` argument.
		After extracting specifiers from the `format` argument, this function at first try to find the exactly same specifier. When failed, it then try `spec.match(key)` (spec is the extracted specifier from the string) with each key. Therefore, you can actually try something wild! Like, make a specifier like `%[0-9]*c` and write a function that slice the input string into specific length - for example, `%4c` keeps the four chars only or so.
	- `splitter` (optional)
		A string or RegExp that will be used to split the `line` argument. The default value is the same as that of [scanl.sscan]( #scanl-sscan )'s `splitter` parameter.

### Return Value
An array of the values you specified. It may contain any amount of [`scanl.EOL`]( scanl-EOL ) at the end (see `options.allowLengthUnmet` above).

### Examples
```js
const str = getAStringSomeHow(); // for example, "12 + 24"
const [x, oper, y] = sscanf(str, "%f %s %f"); // [12, "+", 24]
```

## (class) scanl.LineScanner <a id="scanl-LineScanner"></a>
A class that controls a readline interface, providing a line-by-line input consumption.
It extends the EventEmitter class.

### Constructor
```js
new LineScanner(rl);
```

###	Constructor Parameters
- `rl`
	An instance of [readline.Interface]( https://nodejs.org/api/readline.html#class-readlineinterface ).
	To automatically create a readline interface whose `input` is stdin, see [scanl.createLineScanner]( scanl.createLineScanner ).

### Intance Methods
- [`LineScanner.prototype.getLine()`]( #scanl-LineScanner-prototype-getLine )
	(Async) Get an unmodified line. If there is no unconsumed line left, wait for new lines.
- [`LineScanner.prototype.scan()`]( #scanl-LineScanner-prototype-scan )
	(Async) Get an array that's splitted from a line.  If there is no unconsumed line left, wait for new lines.
- [`LineScanner.prototype.scanf()`]( #scanl-LineScanner-prototype-scanf )
	(Async) Extract strings from a line, and convert them into types specified in `format` argument. If there is no unconsumed line left, wait for new lines.
- [`LineScanner.prototype.close()`]( #scanl-LineScanner-prototype-close )
	Close the LineScanner (and the readline instance) so that it doesn't block the program from exiting normally.
- [`LineScanner.prototype.isEmpty()`]( #scanl-LineScanner-prototype-isEmpty )
	`true` means it may takes time to `getLine()`, `scan()` or `scanf()`, as there is no unprocessed lines left.
- [`LineScanner.prototype.isEof()`]( #scanl-LineScanner-prototype-isEof )
	`true` means from then on, the `getLine()` will always return `EOF`, and the `scan()` & `scanf()` will always return `[ EOF ]`, as the readline is closed and there is no lines left.
- [`LineScanner.prototype.shorthand()`]( #scanl-LineScanner-prototype-shorthand )
	Create an object containing this-unrelated versions of the methods above.

Others are inherit from EventEmitter class.

### Instance Properties
- `LineScanner.prototype.closed`
	A boolean indicating whether the LineScanner instance is closed.
- `LineScanner.prototype.readline`
	An instance of [readlinePromises.Interface]( https://nodejs.org/api/readline.html#class-readlinepromisesinterface ) that's passed to the constructor when the instance is created.

## (async) scanl.LineScanner.prototype.getLine() <a id="scanl-LineScanner-prototype-getLine">
Get a line from the readline instance. If there is no unconsumed line left, wait for new lines. If this LineScanner is closed, return [`EOF`]( #scanl-EOF ).

### Syntax
```js
getLine();
```

### Parameters
None.

### Return Value
A promise that resolves to a string or a Symbol.
- A string, which is originally gotten from the readline's `line` event.
- The symbol [`EOF`]( #scanl-EOF ), which indicates that the readline is closed.

### Examples
```js
console.log("Say something!");
// user inputs: "Hello, man!\n"
const userSays = await myLineScanner.getLine(); // "Hello, man!"
```

## (async) scanl.LineScanner.property.scan() <a id="scanl-LineScanner-prototype-scan"></a>
Get a line, split it with splitter into an array, and then filter out all the empty ones. If there is no unconsumed line left, wait for new lines. If the LineScanner is closed, 

For a instance named `lineScanner`, calling `lineScanner.scan(splitter)` is essentially the same as calling `scanl.sscan(await lineScanner.getLine(), splitter)`. The difference is this function returns `[ EOF ]` when the readline is closed, whereas the other fails.

### Syntax
```js
scan();
scan(splitter);
```

### Parameters
- `splitter`
	An regexp or a string. See more in [scanl.sscan]( #scanl-sscan ).

### Return Value
A promise that resolves to an array of strings, or a single-member array whose last member is EOF.
- `[ EOF ]` indicates the readline is closed.

### Examples
```js
console.log("Say something:");
// user types: "Morning, sir!"
const words = await myLineScanner.sscan();
```

## (async) scanl.LineScanner.prototype.scanf() <a id="scanl-LineScanner-prototype-scanf"></a>
Get a line, extract string slices from it, and then convert the types accordingly.

For a LineScanner instance named `ls`, calling `ls.scanf(formatStr, options)` essentially the same as `sscanf(await ls.getLine(), formatStr, options)`. But while this function return `[ EOF ]` when the readline of the ls is closed, the other throws errror.

### Syntax
```js
sscanf(format)
sscanf(format, options)
```

### Parameters
Check [scanl.sscanf()]( #scanl-sscanf ), ignore the `line` parameter.

### Return Value
A promise that resolves to an array of required values, or a single-member array whose last member is [`EOF`]( #scanl-EOF ).
- For an array of required values, check [scanl.sscanf()]( #scanl-sscanf ).
- `[ EOF ]` indicates the readline is closed.

### Examples
```js
let a, b, c, count = 0;
while(([a, b, c] = await myLineScanner.scanf("%d %d %d")).at(-1) != scanl.EOF) {
	console.log(a + 1, b + 2, c + 3);
	if(++count > 5) {
		break;
	}
}
myLineScanner.close();
```

## scanl.LineScanner.prototype.close() <a id="scanl-LineScanner-prototype-close"></a>
Close the current LineScanner instance and the readline instance of it. Remember to call this at the end of your code, otherwise the code won't automatically exit.

### Syntax
```js
close();
```

### Parameters
None.

### Return Value
None.

## scanl.LineScanner.prototype.isEmpty() <a id="scanl-LineScanner-prototype-isEmpty"></a>
Check whether the LineScanner instance has unconsumed lines. If not, the next call to the instance's `getLine()`, `scan()`, or `scanf()` may takes longer.

### Syntax
```js
isEmpty()
```

### Parameters
None.

### Return Value
A boolean indicates whether the LineScanner instance has unconsumed lines.


## scanl.LineScanner.prototype.isEof() <a id="scanl-LineScanner-prototype-isEof"></a>
Check if we have reached "the end of file" - no more data can be read.

### Syntax
```js
isEof();
```

### Parameters
None.

### Return Value
A boolean. If `true`, it indicates that there is no unconsumed lines left, and the readline instance is closed, too. The future calls to the LineScanner instance's `getLine()`, `scan()`, and `scanf()` will result in `EOF`, `[ EOF ]`, and `[EOF]`, respectively.

### Examples
```js
// The LineScanner instance here is called ls.
while(!ls.isEof()) {
	const myLine = await ls.getLine();
	doSomethingTo(myLine);
}

console.log("It's the end of the file, byebye!");
// You don't have to call ls.close() here, because the readline instance for ls is closed.
// But always call it is considered to be a best practice.
```

## scanl.LineScanner.prototype.shorthand() <a id="scanl-LineScanner-prototype-shorthand"></a>
A function that returns some functions allowing `this`-irrelevant calls, including `getLine`, `scan`, `scanf`, `close`, `isEmpty`, and `isEof`. See the explanation in the examples below.

If you provide an object for the parameter `obj`, it will also `Object.assign(obj, resultObject)`, where the resultObject is the return value described below. This argument won't affect the return value.

### Syntax
```js
shorthand();
shorthand(obj);
```

### Parameters
- obj (Optional)
	An object to assign the functions onto. The object will have some new properties the same as the object that will be returned. See more about the retune object below.

### Return Value
An object containing a bunch of functions. In each entry, the key is the function's name, and the value is the function itself. Here are the methods: 
- `getLine`
	A function for the LineScanner instance's `getLine` method.
- `scan`
	A function for the LineScanner instance's `scan` method.
- `scanf`
	A function for the LineScanner instance's `scanf` method.
- `close`
	A function for the LineScanner instance's `close` method.
- `isEmpty`
	A function for the LineScanner instance's `isEmpty` method.
- `isEof`
	A function for the LineScanner instance's `isEof` method.

### Examples

As you know, in JavaScript, in a function, the `this` keyword means the object that the function is called on. 
(See the explanation in the [Function Context]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this#function_context ) of the `this` keyword.) Therefore, for a LineScanner called `ls`, you cannot 
```js
const getLine = ls.getLine;
const myLine = await getLine(); // Uncaught TypeError: Cannot read properties of undefined (reading '#unprocessedLines')
``` 
In the example above, the `this` is undefined. So, by doing so, you cannot expect the same effect as calling `ls.getLine()` directly.

Normally, you have to achieve that with 
```js
const getLine = (...x) => ls.getLine(...x); // or
const getLine = ls.getLine.bind(ls);

const myLine = await getLine(); // successful
```
But it'll be exhausting to do this for all the functions! Thus, this function borns!

#### Destructing Assignment
You can call and rename the functions with 
```js
const { getLine, scanf, isEof: lsIsEof } = ls.shorthand();
	// use the `getLine` and `scanf` functions, and renames the `isEof` function to `lsIsEof`.

const myLine = await getLine(); // successful
```

#### `globalThis` Assignment
You can do this, but it's not considered to be the best practice:
```js
ls.shorthand(globalThis);
```
This code affects the global scope, and also creates functions with names hard to understand (such as close). The way described above is much better.

## (async) scanl.createLineScanner <a id="scanl-createLineScanner"></a>
Create a LineScanner instance with the argument `rl` being a readline instance whose input is `process.stdin`.

### Syntax
```js
createLineScanner()
```

### Parameters
None.

### Return Value / Value
A promise that resolves to a LineScanner instance.

### Examples
```js
const stdin = await scanl.createLineScanner();
```

# Submodule "@xppkp/boost/print.mjs" <a id="submodule-print"></a>
This reference assumes the users import this module with such code:
```js
import * as print from "@xppkp/boost/print.mjs";
```

## print.print() <a id="print-print"></a>
A utility function to print into `process.stdout` easily.

### Syntax
```js
print(str1);
print(str1, str2);
print(str1, str2, /*... ,*/ strN);
```

### Parameters
- `str1`, ..., `strN`
	Anything that can be turned into a string with `` `${theThing}` ``. When more than one is provided, this function automatically add spaces between.

### Return Value
See the return values of [writable.write()]( https://nodejs.org/api/stream.html#writablewritechunk-encoding-callback ). 

### Examples
```js
print("Hello"); // "Hello" in stdout
print("Hello", "world"); // "Hello world" in stdout
print(42, "is the ultimate answer"); // "42 is the ultimate answer" in stdout
```

## print.printl() <a id="print-printl"></a>
A utility function to print a line into `process.stdout` easily. That is, it always adds a os.EOL at the end of the output.

### Syntax
```js
printl(str1);
printl(str1, str2);
print;(str1, str2, /*... ,*/ strN);
```

### Parameters
- `str1`, ..., `strN`
	Anything that can be turned into a string with `` `${theThing}` ``. When more than one is provided, this function automatically add spaces between.

### Return Value
See the return values of [writable.write()]( https://nodejs.org/api/stream.html#writablewritechunk-encoding-callback ). 

### Examples
```js
print("Hello"); // in stdout, "Hello\n" on POSIX, "Hello\r\n" on Windows.
print("Hello", "world"); // in stdout, "Hello world\n" on POSIX, "Hello world\r\n" on Windows.
print(42, "is the ultimate answer");
	// in stdout, "42 is the ultimate answer\n" on POSIX, 
	// "42 is the ultimate answer\r\n" on Windows.
```

<!--
##
Description. 

### Syntax
```js
```

### Parameters
- `x`
	Some description.

### Return Value / Value
Description.

### Examples
```js

```

-->
