(function () { 
	
	var obj =  function (pkg, env, req, res, io) {
		this.envSite = function(env) {
			var me = this;
			let v = JSON.parse(JSON.stringify(env));
			let host = req.headers.host;
			if (host) {
				if(host.match(/^node([0-9]+)\_(qa|dev|prod)\.([a-z0-9]+)\.([a-z0-9]+)$/ig)) { 
					v.site_path = v.sites_path + '/' + 'node';
					return v;
				} 
				if(host.match(/^master([0-9]+)\_(qa|dev|prod)\.([a-z0-9]+)\.([a-z0-9]+)$/ig)) { 
					v.site_path = v.sites_path + '/' + 'master';
					return v;
				}
				if(host.match(/^comm([0-9]+)\_(qa|dev|prod)\.([a-z0-9]+)\.([a-z0-9]+)$/ig)) { 
					v.site_path = v.sites_path + '/' + 'comm';
					return v;
				} 
				if(host.match(/^(www\.|dev\.|qa\.|)taobase\.(com|win)$/ig)) { 
					v.site_path = v.sites_path + '/' + 'root';
					return v;
				}
				
				if(host.match(/^([a-z0-9]+)\.dev([0-9]+|)\.(taobase|shusiou)\.(com|win)$/i)) { 
					let RT = host.match(/^([a-z0-9]+|)\.dev([0-9]+)\.(taobase|shusiou)\.(com|win)$/);
					v.site_path = v.root_path + '/devs/' + RT[1];
					return v;
				}
				if(host.match(/^([a-z0-9]+)\_dev([0-9]+|)\.(taobase|shusiou)\.(com|win)$/i)) { 
					let RT = host.match(/^([a-z0-9]+)\_dev([0-9]+|)\.(taobase|shusiou)\.(com|win)$/);
					v.site_path = v.root_path + '/devs/' + RT[1];
					return v;
				}
				if(host.match(/^([a-z0-9]+)\_cell([0-9]+|)\.(taobase|shusiou)\.(com|win)$/i)) { 
					let RT = host.match(/^([a-z0-9]+)\_cell([0-9]+|)\.(taobase|shusiou)\.(com|win)$/);
					v.site_path = v.root_path + '/devs/' + RT[1];
					return v;
				}
			}	
			
			if ((me.isIp(req.headers.host)) && (req.query['_IProuter'])) {
			    if (['master', 'node', 'root', 'comm'].indexOf(req.query['_IProuter']) !== -1) {
				v.site_path = v.sites_path + '/' + req.query['_IProuter'];				
			    } else if (['master', 'node', 'root', 'comm'].indexOf(req.query['_IProuter']) === -1)  {
			    	v.site_path = v.root_path + '/devs/' + req.query['_IProuter'];
			    } else {
			    	v.site_path = v.root_path + '/devs/admin' ;
			    }
			} else {
				v.site_path = v.root_path + '/devs/admin' ;
			}
			return v;
		}
		
		this.send404 = function(v) {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write(v + ' does not exist');
			res.end();		
		}	
		this.send500 = function(err) {
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.write('Error! ' + err.message);
			res.end();			
		}
		this.sendPackage = function(v) {
			var me = this;
			var fn = me.envSite(env).site_path + '/files/package/' + v;
			delete require.cache[__dirname + '/taoPackage.js'];
			var router  = require(__dirname + '/taoPackage.js');
			var P = new router(pkg, me.envSite(env), req, res);						
			P.load(fn);								
		};		
		this.sendFile = function(v) {
			var me = this, fn = me.envSite(env).site_path + '/files/' + v;
			pkg.fs.exists(fn, function(exists) {
				if (exists) {
					res.sendFile(fn); 									
				} else {
					me.send404(v);					
				} 
			});				
		};
		this.sendCMSFile = function(v) {
			var me = this, fn = env.site_contents_path + '/' + v;
			pkg.fs.exists(fn, function(exists) {
				if (exists) {
					res.sendFile(fn); 									
				} else {
					me.send404(v);					
				} 
			});				
		};
		
		this.runApi = function(v) {
			var me = this;
			var p = me.envSite(env).site_path + '/api/' + v;
			
			var patt = new RegExp('.api$', 'i');
			if (!patt.test(v)) {
				me.send404(v);
				return true;
			}
			p = p.replace(patt,'.js');
			
			pkg.fs.exists(p, function(exists) {
				if (exists) {
					pkg.fs.stat(p, function(err, stats) {
						 if (stats.isFile()) {
							
							try {
								delete require.cache[p];
								var taskClass = require(p);
								var entity = new taskClass(pkg, me.envSite(env), req, res, io);
								entity.call();
							} catch(err) {
								pkg.fs.readFile(p, 'utf8', function(err, code) {
									if (!err) {
										try {
											new Function('TAO', code)
											({require : require, pkg: pkg, env: me.envSite(env), req : req, res : res, io : io});
										} catch(err) {
											me.send500(err);
										}
									} else {
										me.send500(err);										
									}
								});								
							}		

						 } else {
							me.send404(v);									 
						 }
					});									
				} else {
					me.send404(v);						
				} 
			});	
		};
		
		this.isIp = function(ip) {
		    var arrIp = ip.split(".");
		    if (arrIp.length !== 4) return false;
		    for (let oct of arrIp) {
			if ( isNaN(oct) || Number(oct) < 0 || Number(oct) > 255)
			    return false;
		    }
		    return true;
		};
	
		this.sendWhoami = function() {
			var me = this;
			pkg.fs.readFile('/var/.tao_whoami.data', 'utf8', function(err,data) {
				if (!err && me.isIp(data)) {
					res.send(data);	
				} else {
					res.send('');	
				}
			});	
		}
		this.snedIndex = function(p) {
			var me = this;
			pkg.fs.exists(me.envSite(env).site_path  + '/files/index.html', (exists) => {
			    if (exists) {
				    me.sendFile('index.html');
			    } else {
				    pkg.fs.exists(me.envSite(env).site_path  + '/api/index.js', (exists) => {
				    	if (exists) me.runApi('index.api');
					else me.send404('index');
				    });
			    }	    
			});
		};			
		this.load = function() {
			var me = this, p = req.params[0];

			var patt = new RegExp('/(api|checkip|package|cms)/(.+|)', 'i');
			var v = p.match(patt);
			if ((v) && typeof v == 'object') {
				switch (v[1]) {
					case 'api':
						me.runApi(v[2]);
						break;
					case 'checkip':
						me.sendWhoami();
						break;	
					case 'package':
						me.sendPackage(v[2]);
						break;
					case 'cms':
						this.sendCMSFile(v[2]);
						break;					
					default:
						me.send404(p);
				}		
			} else {
				if (p.match(/\/$/i)) {
					me.snedIndex(p)
				} else {
					me.sendFile(p);
				}
			}
		};	
	
	};
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = obj;
	} 
	
})();
