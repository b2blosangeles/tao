(function () { 
    var obj =  function (folder) {
        var me = this;
        me.folder = folder;
        var {exec} = require('child_process');
    
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
            return str.replace(patt, '://[userName]:[password]@$2');
        }
    
        this.gitBranches = function(cbk) {
            var me = this;
            exec('cd ' + me.folder + ' && git branch -a', (err, stdout, stderr) => {
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
                    curr = /\*/i.test(item)? item : curr;
                    item = item.replace(/remotes\/origin\//i, '').replace(/\*/i, '').replace(/^\s+|\s+$/gm,'');
                    return item;
                }).filter((value, idx, self) => self.indexOf(value) === idx);
                return (typeof cbk !== 'function') ? '' : cbk({
                    status : 'success',
                    data : {
                        currentBranch : curr.replace(/\*/i, '').replace(/^\s+|\s+$/gm,''),
                        branches : l
                    } 
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
                        branches : l
                    } 
                })
            }); 
        }
        this.gitCheckout = function(branch, cbk) {
            var me = this;
            me.gitBranches(
                function(data) {
                    if (data.status === 'failure') {
                        return (typeof cbk !== 'function') ? '' : cbk(data);
                    } else {
                        if (data.data.branches.indexOf(branch) === -1) {
                            return (typeof cbk !== 'function') ? '' : cbk({
                                status : 'failure',
                                errorMessage : 'branch ' + branch + ' does not exist!' 
                            })
                        } else {
                            exec('cd ' + me.folder + ' && git checkout ' + branch, (err, stdout, stderr) => {
                                if (err) {
                                    return (typeof cbk !== 'function') ? '' : cbk({
                                        status : 'failure',
                                        errorMessage : err.message
                                    })
                                }
                                var l = stdout.split("\n");
                                return (typeof cbk !== 'function') ? '' : cbk({
                                    status : 'success',
                                    data : {
                                        currentBranch : branch,
                                        response : l
                                    } 
                                })
                            }); 
                        }
                    }
                });
        }
        me.gitClone = function(gitUrl, cbk) {
            var me = this;
            exec('rm -fr ' + me.folder  + ' && git clone ' + gitUrl + ' ' + me.folder, 
            (err, stdout, stderr) => {
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
                    data : l 
                })
            }); 
        }    
    }
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = obj;
    } else {
        window.gitTool = function() {
            return obj; 
        }
    }
})();
