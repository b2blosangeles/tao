(function () { 
	var obj =  function () {
		this._getServerIP = function () {
		    var ifaces = require('os').networkInterfaces(), address=[];
		    for (var dev in ifaces) {
			var v =  ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false);
			for (var i=0; i < v.length; i++) address[address.length] = v[i].address;
		    }
		    return address;
		};
		this.uuid = function() {
			return this._getServerIP()
		};
	};
	module.exports = obj;
})();
