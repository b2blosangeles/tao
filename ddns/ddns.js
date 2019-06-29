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
			
			delete require.cache[env.root_path + '/ddns/specialDomain.json'];
			me.specialNames = require(env.root_path + '/ddns/specialDomain.json');
			
			if (me.specialNames[question.name]) {
				me.send([{ 
					name: question.name,
					type: 'A',
					class: 'IN',
					ttl: 1,
					data: me.specialNames[question.name]
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
