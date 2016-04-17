'use es6';

var shelljs = require('shelljs');
var open = require('open');

const userNameCommand = "git config user.name";
const remotOriginUrlCommand = "git config remote.origin.url";

function executeBasicShellCommand(command) {
  return shelljs.exec(command, {silent : true})
                .stdout
                .trim();
};

module.exports = {
  getUserName: function() {
    return executeBasicShellCommand(userNameCommand);
  },

  getRepositoryName: function() {
    const remoteOriginUrl = executeBasicShellCommand(remotOriginUrlCommand);
    return remoteOriginUrl.substring(remoteOriginUrl.lastIndexOf("/") + 1, remoteOriginUrl.lastIndexOf("."));
  }
};
