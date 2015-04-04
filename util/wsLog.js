var logger = function () {};

logger.logFunc = function(sFunName, sOptString) {
	console.log('--->' + sFunName);
	if (sOptString && sOptString !== '') {
		console.log('   ' + '   ' + sOptString);
	}
	console.log('---;\n')
};

module.exports.logger = logger;