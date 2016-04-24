'use es6';

var colors = require('colors');
var GitHubApi = require("github");
var fs = require('fs');
var colors = require('colors');
var open = require('open');
var os = require('os');

const settingsFile = os.homedir() + "/.opengitrc.json";
const github = new GitHubApi({
    version: "3.0.0"
});

function isValidPullRequestsData(pullRequestsData) {
  return pullRequestsData.length == 1;
}

function isValidPullRequestData(pullRequestData) {
  return 'url' in pullRequestData &&
          'html_url' in pullRequestData &&
          'diff_url' in pullRequestData &&
          'patch_url' in pullRequestData &&
          'issue_url' in pullRequestData &&
          'number' in pullRequestData &&
          'state' in pullRequestData &&
          'locked' in pullRequestData &&
          'title' in pullRequestData &&
          'body' in pullRequestData &&
          'created_at' in pullRequestData &&
          'updated_at' in pullRequestData &&
          'closed_at' in pullRequestData &&
          'merged_at' in pullRequestData &&
          'assignee' in pullRequestData &&
          'commits_url' in pullRequestData &&
          'comments_url' in pullRequestData;
}

function translatePullRequestData(pullRequestData) {
  if (!isValidPullRequestData(pullRequestData)) {
    // throw exception
    return;
  }

  return {
    'url' : pullRequestData['url'],
    'html_url' : pullRequestData['html_url'],
    'diff_url' : pullRequestData['diff_url'],
    'patch_url' : pullRequestData['patch_url'],
    'issue_url' : pullRequestData['issue_url'],
    'number' : pullRequestData['number'],
    'state' : pullRequestData['state'],
    'locked' : pullRequestData['locked'],
    'title' : pullRequestData['title'],
    'body' : pullRequestData['body'],
    'created_at' : pullRequestData['created_at'],
    'updated_at' : pullRequestData['updated_at'],
    'closed_at' : pullRequestData['closed_at'],
    'merged_at' : pullRequestData['merged_at'],
    'assignee' : pullRequestData['assignee'],
    'commits_url' : pullRequestData['commits_url'],
    'comments_url' : pullRequestData['comments_url']
  };

}

function filterPullRequestsData(pullRequestsData) {
  if (!isValidPullRequestsData(pullRequestsData)) {
    // throw exception
    return;
  }

  const filteredPullRequestData = [];
  pullRequestsData.forEach(function(pullRequestData) {
    filteredPullRequestData.push(translatePullRequestData(pullRequestData));
  });
  return filteredPullRequestData;
}

function retrievePullRequestsFromGitHub(user, repo, state, callback) {
  github.pullRequests.getAll({
    'user': user,
    'repo': repo,
    'state': state
  }, function(err, res) {
      callback(res);
  });
}

function writePullRequestsToMemory(pullRequests) {
  fs.stat(settingsFile, function(err) {
    const filteredPullRequests = filterPullRequestsData(pullRequests);
    if (err) {
      fs.writeFile(settingsFile, JSON.stringify({'pullRequests': filteredPullRequests}));
    } else {
      var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      settings.pullRequests = filteredPullRequests;
      fs.writeFile(settingsFile, JSON.stringify(settings));
    }
  });
}

function retrievePullRequestFromMemory(index) {
  var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  if (index < settings.pullRequests.length) {
    return settings.pullRequests[index];
  }

  console.log('can only accept index values between 0 and ' + settings.length - 1);
}

function formatShortPullRequest(pullRequestData) {
  return (
    '#' + pullRequestData['number'] + ' | ' +
    pullRequestData['title'] + ' | ' +
    pullRequestData['created_at']
  );
}

function formatIndexedPullRequest(pullRequestData, index) {
  return (
    index + ' | #' +
    pullRequestData['number'] + ' | ' +
    pullRequestData['title'] + ' | ' +
    pullRequestData['created_at']
  );
}

function logIndexedFormattedPullRequests(pullRequests) {
  for (i = 0; i < pullRequests.length; i++) {
    console.log(formatIndexedPullRequest(pullRequests[i], i));
  }
}

function storeAndLogPullRequests(pullRequests) {
  writePullRequestsToMemory(pullRequests);
  logIndexedFormattedPullRequests(pullRequests);
}

module.exports = {

  logAllOpenPullRequests: function(user, repo) {
    console.log('Open Pull Requests'.underline.red + ' ');
    retrievePullRequestsFromGitHub(user, repo, 'open', storeAndLogPullRequests);
  },

  logPullRequest: function(index, shouldOpen) {
    const pullRequest = retrievePullRequestFromMemory(index);
    if (shouldOpen) {
      open(pullRequest.html_url);
      return;
    }

    console.log("Pull Request:".underline.red +  ' ' +
                formatShortPullRequest(pullRequest).green);
    
  },

  getPullRequestNumber: function(index) {
    return retrievePullRequestFromMemory(index).number;
  }
};