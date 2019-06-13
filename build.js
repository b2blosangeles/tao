var exec = require('child_process').exec;
var fs    = require('fs');


console.log('Start install npm ...');
exec(
	'npm install forever -g '
	, function(error, stdout, stderr) {
		console.log(error);
	_f();
});		

var _f = function() {
	exec("rm /etc/init.d/tao_*", function(error, stdout, stderr) {	
		exec("update-rc.d -f 'tao_*' remove",
			function(error, stdout, stderr){
				// Start Build
				var bufA = fs.readFileSync(__dirname+'/script_template/node_http' , "utf8");	
				
				fs.writeFileSync('/etc/init.d/tao_node', 
					bufA.replace(/{\$APPLICATION_DIRECTORY}/, __dirname).
						replace(/{\$APPLICATION_START}/, 'tao_server.js').
						replace(/{\$APPLICATION_NAME}/, 'tao_node').
						replace(/{\$APPLICATION_CODE}/, 'tao_node')
					);	
				exec('chmod +x /etc/init.d/tao_node');
				exec('update-rc.d tao_node defaults');

				var bufB = fs.readFileSync(__dirname+'/script_template/node_cron' , "utf8");
				
				fs.writeFileSync('/etc/init.d/tao_cron', bufB.replace(/{\$APPLICATION_DIRECTORY}/, __dirname+'/cron'));
				exec('chmod +x /etc/init.d/tao_cron');
				exec('update-rc.d tao_cron defaults');

				console.log('Build done. Need reboot ');
			//	exec('reboot');
			}
		);		
		
	});
		
	
}
