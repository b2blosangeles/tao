(function () { 
	var obj =  function () {
		this.sno = 1;
		this._getServerIP = function () {
		    var ifaces = require('os').networkInterfaces(), address=[];
		    for (var dev in ifaces) {
			var v =  ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false);
			for (var i=0; i < v.length; i++) address[address.length] = v[i].address;
		    }
		    return address;
		};
		this.uuid = function() {
			let ips = this._getServerIP();
			var ipv = 0
			for (var i = 0; i < ips.length; i++) {
				ipv += parseInt(ips[i].replace('.', ''));
			}
			return ipv + '.' +  Math.floor(new Date().getTime() * 0.001) + '.' + this.sno;
		};
	};
	module.exports = obj;
})();
