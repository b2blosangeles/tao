(function () { 
	var obj =  function (env, _dns, ns_ip) {
		this.validateIPaddress = function (ip)  {
			let patt = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
			return (patt.test(ip)) ?  true : false;
  		}
		this.sendNodeNamedIP = function(name, key, req, res) {
			let me = this, k;
			 if (isNaN(key) || key === '0') { 
			 	res.end(); 
				return true;
			} else {
				k = parseInt(key) - 1;
			}
		
			if (!_dns.n.list.length || (new Date().getTime() - _dns.n.tm) > 60000 ) {
				var mysql = require(env.sites_path + '/root/api/inc/mysql/node_modules/mysql'),
				config = require(env.config_path + '/config.json'),
				cfg0 = config.db;
				let ips = [];
				var str = 'SELECT `ip` from `cloud_node` WHERE `score` < 900 ORDER BY `ip` ASC ';
				var connection = mysql.createConnection(cfg0);
				connection.connect();
				connection.query(str, function (error, results, fields) {
					connection.end();
					if (error) {
						return true;
					} else {
						if (results) {
							for (var i = 0; i < results.length; i++) {
								ips[ips.length] =  results[i].ip;
							}
						} else {
						}

					}
					_dns.n.list = ips;
					_dns.n.tm = new Date().getTime();
					me.send([{ 
						name: name,
						type: 'A',
						class: 'IN',
						ttl: 60,
						data: ips[k]
					}], req, res);
				});
			} else {
				me.send([{ 
					name: name,
					type: 'A',
					class: 'IN',
					ttl: 60,
					data: _dns.n.list[k]
				}], req, res);			
			}
		};
		
		this.send = function(v, req, res) {
			let me = this;
			v.data =  (me.validateIPaddress(v.data)) ? v.data : null;
			res.answer = v;	
			res.end();
		};
		
		this.sendRecord = function(req, res) {
			let me = this, question = req.question[0], 
			    patt = {
				    ip: /^IP\_([0-9\_]+)\.service\./ig,
				    idx:/node([0-9]+)\.service\./ig,
				    node:/node([0-9]+)\.service\./ig,
				    comm:/comm([0-9]+)\.service\./ig,
				    master:/master([0-9]+)\.service\./ig
			    },	    
			    mh = '', m;		
			
			/* -- for special domain */
			
			delete require.cache[env.root_path + '/ddns/specialDomain.json'];
			this.specialNames = require(env.root_path + '/ddns/specialDomain.json');
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
			
			/* -- for special domain end */
			/*
			for (var key in patt) {
				if (patt[key].test(question.name)) {
					mh = key;
					break;
				}
			}
			switch (mh) {
				case 'ip': 
					m = new RegExp(patt[mh]).exec(question.name);
					let ip = m[1].replace(/\_/ig, '.');
					me.send([{ 
						name: question.name,
						type: 'A',
						class: 'IN',
						ttl: 60,
						data: ip
					}], req, res);
					break;
				case 'idx': 
				case 'node':
					m = new RegExp(patt[mh]).exec(question.name);
					me.sendNodeNamedIP(question.name, m[1], req, res);
					break;
				case 'comm':
					m = new RegExp(patt[mh]).exec(question.name);
					me.sendCommNamedIP(question.name, m[1], req, res);
					break;
				case 'master':	
					m = new RegExp(patt[mh]).exec(question.name);
					me.sendMasterNamedIP(question.name, m[1], req, res);
					break;	
				case 'www': 
					me.send([{ 
						name: question.name,
						type: 'A',
						class: 'IN',
						ttl: 60,
						data: ns_ip
					}], req, res);				
					break;
				default:
					me.send([{ 
						name: question.name,
						type: 'A',
						class: 'IN',
						ttl: 60,
						data: null
					}], req, res);					
			}
			*/
		};	
	};
	module.exports = obj;
})();
