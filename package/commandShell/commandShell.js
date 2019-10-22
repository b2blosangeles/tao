(function () {
      var obj =  function () {
            let me = this;
            
            me.batchExec = function(listCmd, cbk) {
                 var crowdProcess = require('../../package/crowdProcess/crowdProcess'); 
                 var list = listCmd.split(/\&\&/);
                 cbk(list);
            }
            me.exec = function(cmd, cbk, timeout) {
                var { spawn } = require('child_process');
                var cmda = cmd.split(/[\s]+/), retStr = {}, normalClosed = false, resultData = '', isError = false;
                var ps = spawn(cmda.shift(), cmda, {detached: true});
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
