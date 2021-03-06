var tsc = require('./lib/compiler');

exports.compile = function(file, code){
	var compiler = tsc.compiler;
	tsc.initDefault();
	tsc.resolve(file, code, compiler);
	compiler.typeCheck();
	var stdout = new tsc.EmitterIOHost();
	compiler.emit(stdout);

	var jscode = '';
	for (var attr in stdout.fileCollection) {
		jscode = stdout.fileCollection[attr].lines.join('');
	};
	return jscode;
}
