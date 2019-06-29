var CronJobManager = require('./crontab_manager.js');
var CrowdProcess = require('../package/crowdProcess/crowdProcess');
var manager = new CronJobManager();
var exec = require('child_process').exec;
var fs    = require('fs'), path = require('path');
var root_path =  path.join(__dirname, '..');

var LOG = require(root_path + '/package/log/log.js');
var log = new LOG();

let _svs_type = [],
    _dev_type = [],
    CP0 = new CrowdProcess(),
    CP = new CrowdProcess(),
    _f0 = {},
    _f = {};

 _f0['devs'] = function(cbk) {
	fs.readdir(root_path + '/devs', (err, files) => {
		var list = [];
		for (var i=0; i < files.length ;  i++) {
			if (files[i] !== 'README.md') {
				list.push(files[i]);
			}
		}
		_dev_type = list;
		cbk(true);
	});
}
 _f0['sites'] = function(cbk) {
	fs.readdir(root_path + '/sites', (err, files) => {
		var list = [];
		for (var i=0; i < files.length ;  i++) {
			if (files[i] !== 'README.md') {
				list.push(files[i]);
			}
		}
		_svs_type = list;
		cbk(true);
	});
}
CP0.serial(
	_f0,
	function(data0) {
		for (var i in _svs_type) {
			_f[_svs_type[i]] = (function(i) {
				return function(cbk) {
					let conf_file = root_path + '/sites/' + _svs_type[i] + '/cron_service/cron.json';
					fs.exists(conf_file, function(exists){
						let cron_item = [];
						if(exists) {
							try {
								cron_item = require(conf_file);	
							} catch (e) {
								log.write("/var/log/tao_cron.log", 'cron', conf_file + ' format error!');
							}
						}
						cbk(cron_item);
					});	
				}
			})(i);
		}
		
		for (var i in _dev_type) {
			_f[_dev_type[i]] = (function(i) {
				return function(cbk) {
					let conf_file = root_path + '/devs/' + _dev_type[i] + '/cron_service/cron.json';
					fs.exists(conf_file, function(exists){
						let cron_item = [];
						if(exists) {
							try {
								cron_item = require(conf_file);	
							} catch (e) {
								log.write("/var/log/tao_cron.log", 'cron', conf_file + ' format error!');
							}
						}
						cbk(cron_item);
					});	
				}
			})(i);
		}
		CP.serial(
			_f,
			function(data) {
				let cron= [];
				for (var i in _svs_type) {
					for (var j = 0; j < CP.data[_svs_type[i]].length; j++ ) {
						let rec = CP.data[_svs_type[i]][j];
						rec.id = _svs_type[i] + '_' + rec.id;
						rec.type = 'sites';
						rec.space = _svs_type[i];
						cron.push(rec);
					}				
				}
				
				for (var i in _dev_type) {
					for (var j = 0; j < CP.data[_dev_type[i]].length; j++ ) {
						let rec = CP.data[_dev_type[i]][j];
						rec.id = _dev_type[i] + '_' + rec.id;
						rec.type = 'devs';
						rec.space = _dev_type[i];
						cron.push(rec);
					}				
				}

				for (var i = 0; i < cron.length; i++) {
					var f = function(v) {
						return function() {
							exec('cd ' + root_path + '/' + v.type + '/' + v.space + '/cron_service' + ' &&  node ' + v.script, 
							     {maxBuffer: 1024 * 2048},
							     function(error, stdout, stderr) {
								if (error) {
									log.write("/var/log/tao_cron.log", 'cron::'+v.script,  JSON.stringify(error));
								} else {
									if (!stderr) {
										log.write("/var/log/tao_cron.log", 'cron::'+v.script, JSON.stringify({status:'success', id:v.id, message:log.transformText(stdout)}));
									} else {
										log.write("/var/log/tao_cron.log", 'cron::'+v.script, JSON.stringify({status:'error', id:v.id, message:log.transformText(stderr)}));
									}
								}	
							});

						}
					};
					if (manager.exists( cron[i]['id'])) {
						manager.stop( cron[i]['id']);
					}


					if (cron[i].script) {
						if (!manager.exists( cron[i]['id'])) {
							manager.add( cron[i]['id'], cron[i]['schedule'], f(cron[i]), null, false, "America/Los_Angeles");
						} else {
							manager.deleteJob( cron[i]['id']);
						}
						manager.start( cron[i]['id']);
					}	
				}
			},
			6000
		);
	
	}, 600);
