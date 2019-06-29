(function () { 
	var obj =  function (env, _dns, ns_ip) {
		this.validateIPaddress = function (ip)  {
			let patt = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
			return (patt.test(ip)) ?  true : false;
  		}
		
		this.send = function(v, req, res) {
			let me = this;
			v.data =  (me.validateIPaddress(v.data)) ? v.data : null;
			res.answer = v;	
			res.end();
		};
		
		this.sendRecord = function(req, res) {
			let me = this, question = req.question[0];		
			
			/* -- for special domain */
			delete require.cache[env.config_path + '/dns.json'];
			me.dnslist = require(env.config_path + '/dns.json');
			
			console.log(env);
			
			if (me.dnslist[question.name]) {
				me.send([{ 
					name: question.name,
					type: 'A',
					class: 'IN',
					ttl: 1,
					data: me.dnslist[question.name]
				}], req, res);	
				return true;
			} else {
				me.send([{ 
					name: question.name,
					type: 'A',
					class: 'IN',
					ttl: 1,
					data: null
				}], req, res);	
			}
		};	
	};
	module.exports = obj;
})();
