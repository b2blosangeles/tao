(function () { 
	var obj =  function (pkg, env, _dns, ns_ip) {
		this.validateIPaddress = function (ip)  {
			let patt = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
			return (patt.test(ip)) ?  true : false;
  		}
		
		this.send = function(v, req, res) {
			let me = this;
			if (!v || !v.length) {
				res.answer = null;
			} else {
				v[0].data =  (me.validateIPaddress(v[0].data)) ? v[0].data : null;
				res.answer = v;
			}	
			res.end();
		};
		
		this.sendRecord = function(req, res) {
			let me = this, question = req.question[0];		
			let CP = new pkg.crowdProcess(), _f = {};
			
			_f['master'] = function(cbk) {
				let fn = env.config_path + '/main_dns.json';
				pkg.fs.readFile(fn, 'utf8', function read(err, data) {
				    if (err) {
					    cbk(false);
				    } else {
				    	var DS = {};
					try { DS = JSON.parse(data); } catch(e) {}
					if (DS[question.name]) {
						me.send([{ 
							name: question.name,
							type: 'A',
							class: 'IN',
							ttl: 600,
							data: DS[question.name]
						}], req, res);
						CP.exit = 1;
						cbk(true);
					} else {
						cbk(false);
					}	
				    }
				});
			}
			
			_f['rule'] = function(cbk) {
				let fn = env.config_path + '/rule_dns.data';
				pkg.fs.readFile(fn, 'utf8', function read(err, data) {
				    if (err) {
					    cbk(false);
				    } else {
					var DL =  [];
					try { DL = data.split("\n"); } catch(e) {}
					DL = DL.reverse(); 
					for (var i = 0; i < DL.length; i++) {
					    DL[i] = DL[i].split('=>');
					    if (DL[i].length == 2) {
						var key = DL[i][0].replace(/^\s+|\s+$/gm,''),
						    ip =  DL[i][1].replace(/^\s+|\s+$/gm,'');

						var re = new RegExp(key, 'i');
						if (key === question.name || re.test(question.name)) {
						    me.send([{ 
							name: question.name,
							type: 'A',
							class: 'IN',
							ttl: 600,
							data: ip
						    }], req, res);
						    CP.exit = 1;
						    cbk(true);
						    return true
						}
					    }
					} 
					cbk(false);	
				    }
				});
			}
			CP.serial(
				_f,
				function(data) {
					if (!CP.data.master || !CP.data.rule) {
						res.end();
						/*
						me.send([{ 
							name: question.name,
							type: 'A',
							class: 'IN',
							ttl: 10,
							data: null
						}], req, res);*/
					}
				}, 1000
			);
		};	
	};
	module.exports = obj;
})();
