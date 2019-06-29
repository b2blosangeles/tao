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
				let fn = env.config_path + '/dns.json';
				pkg.fs.readFile(fn, function read(err, data) {
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
							ttl: 1,
							data: DS[question.name]
						}], req, res);
						CP.exit = 1;
						console.log('---1---');
						cbk(true);
					} else {
						cbk(false);
					}	
				    }
				});
			}
			_f['dynamic'] = function(cbk) {
				let fn = env.config_path + '/dns.json';
				pkg.fs.readFile(fn, function read(err, data) {
				    if (err) {
					    cbk(false);
				    } else {
				    	var DS = {};
					try { DS = JSON..parse(data); } catch(e) {}
					if (DS[question.name]) {
						me.send([{ 
							name: question.name,
							type: 'A',
							class: 'IN',
							ttl: 1,
							data: DS[question.name]
						}], req, res);
						CP.exit = 1;
						console.log('---2---');
						cbk(true);
					} else {
						cbk(false);
					}	
				    }
				});
			}
			CP.serial(
				_f,
				function(data) {
					if (!CP.data.master && !CP.data.dynamic) {
						me.send([{ 
							name: question.name,
							type: 'A',
							class: 'IN',
							ttl: 1,
							data: null
						}], req, res);	
						console.log('---3---');
					}
				}, 1000
			);
		};	
	};
	module.exports = obj;
})();
