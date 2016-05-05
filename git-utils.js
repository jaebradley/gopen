'use es6';

var shelljs = require('shelljs');
var open = require('open');
var GitHubApi = require("github");
var fs = require('fs');
var os = require('os');
var prompt = require('prompt');

prompt.start();

const settingsFile = os.homedir() + "/.opengitrc.json";

const remoteOriginUrlCommand = "git config --get remote.origin.url";

function executeBasicShellCommand(command) {
  return shelljs.exec(command, {silent : true})
                .stdout
                .trim();
};

function isGitHubEnterprise(remoteOriginUrl) {
  return remoteOriginUrl.indexOf("https://github.com") <= -1;
}

function getUserName(remoteOriginUrl) {
  return remoteOriginUrl.substring(remoteOriginUrl.lastIndexOf(".com/") + 5, remoteOriginUrl.lastIndexOf("/"));
}

function getRepositoryName(remoteOriginUrl) {
    return remoteOriginUrl.substring(remoteOriginUrl.lastIndexOf("/") + 1, remoteOriginUrl.lastIndexOf("."));
}

function getEnterpriseHost(remoteOriginUrl) {
  return remoteOriginUrl.substring(8, remoteOriginUrl.lastIndexOf(".com/") + 4);
}

function promptAuthenticationData(host) {
    console.log("gotta get some authentication information...");
    prompt.get(
      [
        {
          name: 'username',
          required: true
        },
        {
          name: 'password',
          required: true,
          hidden: true
        }
      ], function (err, result) {
        console.log("ok, now try that again!");
        writeAuthenticationDataToMemory(host, result.username, result.password);
    });
  }

function testPassword(username, password) {

}

function isAuthenticationDataInMemory(host) {
  if (!fs.existsSync(settingsFile)) {
    return false;
  }
  else {
    var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    if (settings[host] === undefined) {
      return false;
    }

    return ('password' in settings[host]) && ('username' in settings[host]);
  }
}

function writeAuthenticationDataToMemory(host, username, password) {
  const authenticationData = {
                                password: password,
                                username: username
                              };
  fs.stat(settingsFile, function(err) {
    const settings = {};
    if (!err) {
      const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    }
    settings[host] = authenticationData;
    fs.writeFile(settingsFile, JSON.stringify(settings));
  });
}

function getEnterpriseAuthenticationDataFromMemory(host) {
  var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  return settings[host];
}

function getAuthenticatedEnterpriseGitHubClient(remoteOriginUrl) {
  const enterpriseHost = getEnterpriseHost(remoteOriginUrl);
  const authenticationData = getEnterpriseAuthenticationDataFromMemory(enterpriseHost);
  const corporateGitHubClient = new GitHubApi({
      version: "3.0.0",
      pathPrefix: "/api/v3/",
      protocol: "https",
      host: enterpriseHost
  });

  corporateGitHubClient.authenticate({
    type: "basic",
    username: authenticationData['username'],
    password: authenticationData['password']
  });

  return corporateGitHubClient;
}

module.exports = {
  isGitHubEnterprise: function() {
    const remoteOriginUrl = executeBasicShellCommand(remoteOriginUrlCommand);
    return isGitHubEnterprise(remoteOriginUrl);
  },

  getGitHubClient: function() {
    const remoteOriginUrl = executeBasicShellCommand(remoteOriginUrlCommand);
    if (isGitHubEnterprise(remoteOriginUrl)) {
      return getAuthenticatedEnterpriseGitHubClient(remoteOriginUrl);
    }

    return new GitHubApi({ version: "3.0.0" });
  },

  getUserName: function() {
    const remoteOriginUrl = executeBasicShellCommand(remoteOriginUrlCommand);
    return remoteOriginUrl.substring(remoteOriginUrl.lastIndexOf(".com/") + 5, remoteOriginUrl.lastIndexOf("/"));
  },

  getRepositoryName: function () {
    const remoteOriginUrl = executeBasicShellCommand(remoteOriginUrlCommand);
    return remoteOriginUrl.substring(remoteOriginUrl.lastIndexOf("/") + 1, remoteOriginUrl.lastIndexOf("."));
  },

  isAuthenticationDataInMemory: function() {
    const remoteOriginUrl = executeBasicShellCommand(remoteOriginUrlCommand);
    return isAuthenticationDataInMemory(getEnterpriseHost(remoteOriginUrl));
  },

  promptAuthenticationData: function() {
    const remoteOriginUrl = executeBasicShellCommand(remoteOriginUrlCommand);
    const host = getEnterpriseHost(remoteOriginUrl);
    promptAuthenticationData(host);
  }
};
