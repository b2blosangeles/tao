(function () {
      var obj =  function () {
            let me = this;
            
            me.batchExec = function(listCmd, cbk, timeout) {
                 var crowdProcess = require('../../package/crowdProcess/crowdProcess'); 
                 var list = listCmd.split(/\&\&/);
                 var CP = new crowdProcess();
                  var cwd = __dirname;
                 var _f = {};
                 for (var i = 0; i < list.length; i++) {
                       _f['P_'+i] = (function(i) {
                             return function(cbk0) {
                                   var cmd = list[i].replace(/^\s+|\s+$/gm,'');
                                   var m = cmd.match(/cd\s+([^\s]+)$/i);
                                   if (!cmd) {
                                      cbk0({status: 'failure', errorMessage : 'missing command ' + i}); 
                                   } else if (m[1]) {
                                       cwd =  m[1]; 
                                   } else {
                                      me.exec({cmd : cmd, cwd : cwd}, cbk0, (!timeout) ? 8000 :  timeout)
                                   }
                             }
                       })(i)
                 }
                 CP.serial(
                     _f,
                     function(data) {
                          let result = {};
                          for (var i = 0; i < list.length; i++) {
                              if (CP.data['P_'+i]) {
                                    result['P_'+i] = CP.data['P_'+i];
                              }    
                          }
                          data.results = result;
                          cbk(data);
                     }, (!timeout) ? 8000 :  timeout);
            }
            me.exec = function(cfg, cbk, timeout) {
                var { spawn } = require('child_process');
                var cmda = cfg.cmd.split(/[\s]+/), retStr = {}, normalClosed = false, resultData = '', isError = false;
                var param = { detached: true};
                if (cfg.cwd){
                      param = cfg.cwd;
                }
                var ps = spawn(cmda.shift(), cmda, param);
                ps.stdout.setEncoding('utf8')

                ps.stdout.on('data', (data) => {
                    resultData  = data;
                });

                ps.stderr.on('data', (data) => {
                      resultData  +=  data;
                });

                ps.on('error', (code) => {
                  isError = true;
                  if (!retStr.errorMessage) retStr.errorMessage = [];
                  retStr.errorMessage.push(`ps error: ${code}`);
                });
                  
                ps.on('close', (code) => {
                    normalClosed= true
                    if (code !== 0) {
                        isError = true;
                        if (!retStr.errorMessage) retStr.errorMessage = [];
                        retStr.errorMessage.push(`ps process exited with code ${code}`);
                    }
                    retStr.data = {};
                    resultData = resultData.replace(/^\s+|\s+$/gm,'')
                    try {
                          retStr.data = JSON.parse(resultData);
                    } catch (e) {
                          retStr.data = resultData;
                    }
                    retStr.status = (!isError) ? 'success' : 'failure';
                    cbk(retStr);
                });

                setTimeout(function() {
                      if (!normalClosed) {
                          //    ps.kill();
                          process.kill(-ps.pid);
                          isError = true;
                          if (!retStr.errorMessage) retStr.errorMessage = [];
                          retStr.errorMessage.push('shell command timeout!');
                          retStr.status = (!isError) ? 'success' : 'failure';
                          cbk(retStr);
                      }
                }, (!timeout) ? 8000 :  timeout)
            }
      };

      if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            module.exports = obj;
      } 

})();
