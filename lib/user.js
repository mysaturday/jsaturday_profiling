module.exports = function(module){

	var model = require('../model/' + module.settings.user.model);

	return {
		getUser: function(A){console.log("ECCO l'USER!" +  A);}
	};
};