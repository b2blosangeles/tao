var exec = require('child_process').exec;
var cmd = 'cd ' + env.root_path + ' && git pull ';

exec(cmd, function(error, stdout, stderr) {
		 res.send(cmd);
});	
