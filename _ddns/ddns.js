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
			let CP = new pkg.crowdProcess(), _f = {};
			
			_f['master'] = function(cbk) {
				me.masterdnslist = require(env.config_path + '/dns.json');
				if (me.masterdnslist[question.name]) {
					me.send([{ 
						name: question.name,
						type: 'A',
						class: 'IN',
						ttl: 1,
						data: me.masterdnslist[question.name]
					}], req, res);
					CP.exit = 1;
					cbk(true);
				} else {
					cbk(false);
				}	
				
			}
			_f['dynamic'] = function(cbk) {
				delete require.cache[env.config_path + '/dns.json'];
				me.dynamicdnslist = require(env.config_path + '/dns.json');
				
				if (me.dynamicdnslist[question.name]) {
					me.send([{ 
						name: question.name,
						type: 'A',
						class: 'IN',
						ttl: 1,
						data: me.dynamicdnslist[question.name]
					}], req, res);
					CP.exit = 1;
					cbk(true);
				} else {
					cbk(false);
				}
			}
			CP.serial(
				_f,
				function(data) {
					if (!CP.exit) {
						me.send([{ 
							name: question.name,
							type: 'A',
							class: 'IN',
							ttl: 10,
							data: null
						}], req, res);	
					}
				}, 1000
			);
		};	
	};
	module.exports = obj;
})();
