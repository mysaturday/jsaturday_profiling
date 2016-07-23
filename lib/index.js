module.exports = function(module, JSAT){
	return {
		user: require('./user')(module, JSAT)
	};
};