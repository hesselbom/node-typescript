var fs = require('fs');
var _path = require('path');
var TypeScript = require("./wrapper.js").TypeScript;
exports.libdPath = require("./wrapper.js")._libdPath;
var WriterAggregator = (function () {
    function WriterAggregator() {
        this.lines = [];
        this.currentLine = "";
    }
    WriterAggregator.prototype.Write = function (str) {
        this.currentLine += str;
    };
    WriterAggregator.prototype.WriteLine = function (str) {
        this.lines.push(this.currentLine + str);
        this.currentLine = "";
    };
    WriterAggregator.prototype.Close = function () {
        if(this.currentLine.length > 0) {
            this.lines.push(this.currentLine);
        }
        this.currentLine = "";
    };
    WriterAggregator.prototype.reset = function () {
        this.lines = [];
        this.currentLine = "";
    };
    return WriterAggregator;
})();
exports.WriterAggregator = WriterAggregator;
var EmitterIOHost = (function () {
    function EmitterIOHost() {
        this.fileCollection = {
        };
    }
    EmitterIOHost.prototype.createFile = function (s, useUTF8) {
        if(this.fileCollection[s]) {
            return this.fileCollection[s];
        }
        var writer = new WriterAggregator();
        this.fileCollection[s] = writer;
        return writer;
    };
    EmitterIOHost.prototype.directoryExists = function (s) {
        return false;
    };
    EmitterIOHost.prototype.fileExists = function (s) {
        return typeof this.fileCollection[s] !== 'undefined';
    };
    EmitterIOHost.prototype.resolvePath = function (s) {
        return s;
    };
    EmitterIOHost.prototype.reset = function () {
        this.fileCollection = {
        };
    };
    EmitterIOHost.prototype.toArray = function () {
        var result = [];
        for(var p in this.fileCollection) {
            if(this.fileCollection.hasOwnProperty(p)) {
                var current = this.fileCollection[p];
                if(current.lines.length > 0) {
                    if(p !== '0.js') {
                        current.lines.unshift('////[' + p + ']');
                    }
                    result.push({
                        filename: p,
                        file: this.fileCollection[p]
                    });
                }
            }
        }
        return result;
    };
    return EmitterIOHost;
})();
exports.EmitterIOHost = EmitterIOHost;
exports.compiler = new TypeScript.TypeScriptCompiler(new WriterAggregator());
function init() {
    exports.compiler = new TypeScript.TypeScriptCompiler(new WriterAggregator());
}
exports.init = init;
function initDefault() {
    init();
    exports.compiler.parser.errorRecovery = true;
    exports.compiler.setErrorCallback(function (start, len, message, block) {
        console.log('[typescript] (', start, ':', len + ') compilation error: ', message);
    });
    exports.compiler.addUnit(fs.readFileSync(exports.libdPath, 'utf8'), exports.libdPath);
}
exports.initDefault = initDefault;
function resolve(path, code, compiler) {
    var optionRegex = /^[\/]{2}\s*@(\w+):\s*(\S*)/gm;
    var lines = code.split('\r\n');
    if(lines.length === 1) {
        lines = code.split('\n');
    }
    for(var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var isTripleSlashReference = /[\/]{3}\s*<reference path/.test(line);
        var testMetaData = optionRegex.exec(line);
        if(isTripleSlashReference) {
            var isRef = line.match(/reference\spath='(\w*_?\w*\.?d?\.ts)'/);
            if(isRef) {
                var ref = _path.dirname(path) + '/' + isRef[1];
                console.log(ref);
                resolve(ref, fs.readFileSync(ref, 'utf8'), compiler);
            }
        }
    }
    compiler.addUnit(code, path);
}
exports.resolve = resolve;
