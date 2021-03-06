var tsc = require('../lib/compiler');
var compiler = tsc.compiler;

tsc.initDefault();

var code = '\
/// <reference path=\'reference.ts\' />\n\
\
var test = new Test();\
\
class Greeter {\
    greeting: string;\
    constructor(message: string) {\
        this.greeting = message;\
    }\
    greet() {\
        return "Hello, " + this.greeting;\
    }\
}\
var greeter = new Greeter("world");\
var button = document.createElement("button");\
button.innerText = "Say Hello";\
button.onclick = function() {\
    alert(greeter.greet());\
};\
document.body.appendChild(button);\
';

tsc.resolve(__dirname + '/xxx.ts', code, compiler);

compiler.typeCheck();

var stdout = new tsc.EmitterIOHost();
compiler.emit(stdout);
console.log(stdout.fileCollection)
