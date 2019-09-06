(function () { 
    var isNotesClient =  (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	var obj =  function (folder) {
        this.folder = folder;
        this.gitParser = function(str) {
            let patt = new RegExp('^(git|ssh|http|https)\:\/\/([^\@]+\@|\@|)([^\/]+)\/([^\/]+)\/([^\.]+)\.git$', 'i');
            let v = str.match(patt);
            return (!v) ? false : {
                sp    : v[3],
                auth  : v[2].replace(/\@/, ''),
                user  : v[4],
                repo  : v[5]
            } 
        } 
        this.gitAddAuth = function(str, user, pass) {
            let patt = new RegExp('\:\/\/([^\@]+\@|\@|)([^\/]+)', 'i');
            return str.replace(patt, '://' + encodeURIComponent(user) + 
            ((pass) ? (':' + encodeURIComponent(pass)) : '') +  '@$2');
        }
    
        this.gitMaskAuth = function(str) {
            let patt = new RegExp('\:\/\/([^\@]+\@|\@|)([^\/]+)', 'i');
            return str.replace(patt, '://[username]:[password]' +  '@$2');
        }
        if (isNotesClient) {
            var {exec} = require('child_process');
            this.output = function(stdout) {
                var l = stdout.split("\n");
                return l;
            }
            this.getRemoteBranches = function(gitUrl, cbk) {
                var me = this;
                exec('git ls-remote ' + gitUrl + ' ', (err, stdout, stderr) => {
                    if (err) {
			var errType = new RegExp('authentication failed', 'i').test(err.message) ? 'authentication' : null
			return (typeof cbk !== 'function') ? '' : cbk({
				status : 'failure',
				errType : errType,
				errorMessage : err.message
			});
                    }
                    var l = stdout.split("\n").filter(function(item) {
                        var line = item.split('refs/heads/');
                        return (item) && (line[1]);
                    }).map(function(item) {
                        var line = item.split(/refs\/heads\//i);
                        return line[1];
                    }).filter((value, idx, self) => self.indexOf(value) === idx);
                    return (typeof cbk !== 'function') ? '' : cbk({
                        status : 'success',
                        branches : l
                    });
                }); 
            }
            this.gitClone = function(gitUrl, cbk) {
                var me = this;
                var tmpdir = '/tmp/' + new Date().getTime();
                exec('rm -fr ' + tmpdir + ' && git clone ' + gitUrl + ' ' + tmpdir, 
                (err, stdout, stderr) => {
                    if (err) {
                        return (typeof cbk !== 'function') ? '' : cbk({
                            status : 'failure',
                            errorMessage : err.message
                        })
                    } else {
                        exec('cp -r ' + tmpdir + ' ' + me.folder + ' && rm -fr ' + tmpdir,
                        (err, stdout, stderr) => {
                            if (err) {
                                return (typeof cbk !== 'function') ? '' : cbk({
                                    status : 'failure',
                                    errorMessage : err.message
                                })
                            } else {
                                var l = stdout.split("\n");
                                return (typeof cbk !== 'function') ? '' : cbk({
                                    status : 'success',
                                    output : me.output(stdout)
                                })
                            }
                        });
                    }
                }); 
            }    
        
            this.getBranches = function(isLocal, cbk) {
                var me = this;
                exec('cd ' + me.folder + ' && git branch ' + ((isLocal === true) ? ' -a ' : ''), (err, stdout, stderr) => {
                    if (err) {
                      return (typeof cbk !== 'function') ? '' : cbk({
                        status : 'failure',
                        errorMessage : err.message
                      });
                    }
                    var curr = '';
                    var l = stdout.split("\n").filter(function(item) {
                        return (item) && !/\-\>/i.test(item);
                    }).map(function(item) {
                        curr = /\*/i.test(item)? item.replace(/\*/i, '').replace(/^\s+|\s+$/gm,'') : curr;
                        item = item.replace(/remotes\/origin\//i, '').replace(/\*/i, '').replace(/^\s+|\s+$/gm,'');
                        return item;
                    }).filter((value, idx, self) => self.indexOf(value) === idx);
                    return (typeof cbk !== 'function') ? '' : cbk({
                        status : 'success',
                        currentBranch : curr,
                        branches : l
                    });
                }); 
            }
        
            this.gitPull = function(cbk) {
                var me = this;
                exec('cd ' + me.folder + ' && git pull', (err, stdout, stderr) => {
                    if (err) {
                        return (typeof cbk !== 'function') ? '' : cbk({
                            status : 'failure',
                            errorMessage : err.message
                        })
                    }
                    var curr = '';
                    var l = stdout.split("\n");
                    return (typeof cbk !== 'function') ? '' : cbk({
                        status : 'success',
                        data : {
                            currentBranch : curr,
                            output : me.output(stdout)
                        } 
                    })
                }); 
            }
        
            this.gitCheckout = function(branch, cbk) {
                var me = this;
                exec('cd ' + me.folder + ' && git checkout ' + branch, (err, stdout, stderr) => {
                    if (err) {
                        return (typeof cbk !== 'function') ? '' : cbk({
                            status : 'failure',
                            errorMessage : err.message
                        })
                    }
                    return (typeof cbk !== 'function') ? '' : cbk({
                        status : 'success',
                        currentBranch : branch,
                        output : me.output(stdout)
                    })
                }); 
            }
        }

    }
    if (isNotesClient) {
        module.exports = obj;
    } else {
        window.gitModule = function() {
            return obj; 
        }
    }
    
})();
