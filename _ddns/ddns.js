(function () { 
	var obj =  function (pkg, env, _dns, ns_ip) {
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
			let CP = new pkg.crowdProcess();
			/* -- for special domain */
			me.masterdnslist = require(env.config_path + '/dns.json');
			
			if (me.masterdnslist[question.name]) {
				me.send([{ 
					name: question.name,
					type: 'A',
					class: 'IN',
					ttl: 60,
					data: me.masterdnslist[question.name]
				}], req, res);	
				return true;
			} else {
				delete require.cache[env.config_path + '/dns.json'];
				me.dynamicdnslist = require(env.config_path + '/dns.json');
				
				if (me.dynamicdnslist[question.name]) {
					me.send([{ 
						name: question.name,
						type: 'A',
						class: 'IN',
						ttl: 10,
						data: me.dynamicdnslist[question.name]
					}], req, res);	
					return true;
				} else {
					me.send([{ 
						name: question.name,
						type: 'A',
						class: 'IN',
						ttl: 10,
						data: null
					}], req, res);	
				}
			}
		};	
	};
	module.exports = obj;
})();
