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
		this.getSN = function() {
			if (this.sno > 1000000) this.sno = 1;
			else this.sno++;
			return this.sno;
		};
		this.uuid = function() {
			let ips = this._getServerIP();
			var ipv = 0;
			for (var i = 0; i < ips.length; i++) {
				console.log(ips)
				ipv += parseInt(ips[i].replace('.', ''));
			}
			return ipv + '.' +  Math.floor(new Date().getTime() * 0.001) + '.' + this.getSN();
		};
	};
	module.exports = obj;
})();
