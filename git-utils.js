'use es6';

var shelljs = require('shelljs');
var open = require('open');

const remotOriginUrlCommand = "git config --get remote.origin.url";

function executeBasicShellCommand(command) {
  return shelljs.exec(command, {silent : true})
                .stdout
                .trim();
};

module.exports = {
  getUserName: function() {
    const remoteOriginUrl = executeBasicShellCommand(remotOriginUrlCommand);
    return remoteOriginUrl.substring(remoteOriginUrl.lastIndexOf("github.com/") + 11, remoteOriginUrl.lastIndexOf("/"));
  },

  getRepositoryName: function() {
    const remoteOriginUrl = executeBasicShellCommand(remotOriginUrlCommand);
    return remoteOriginUrl.substring(remoteOriginUrl.lastIndexOf("/") + 1, remoteOriginUrl.lastIndexOf("."));
  }
};
