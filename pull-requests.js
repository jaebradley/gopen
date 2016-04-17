#!/usr/bin/env node

'use es6';

var GitHubApi = require("github");
var GitUtils = require("./git-utils");
var PullRequestsUtils = require("./pull-requests-utils");
var CommentsUtils = require("./comments-utils");

var program = require('commander');
var fs = require('fs');

const settingsFile = "/Users/jaebradley/.opengitrc.json";

const github = new GitHubApi({
    version: "3.0.0"
});

const cl = program
            .version('0.0.1')
            .option('-c --closed', 'lookup closed pull requests')
            .option('-a --all', 'lookup all pull requests')
            .option('-i --index <n>', 'lookup pull request with index value', parseInt)
            .parse(process.argv);

function writePullRequests(pullRequests) {
  fs.stat(settingsFile, function(err) {
    if (err) {
      fs.writeFile(settingsFile, JSON.stringify({'pullRequests': PullRequestsUtils.generateFilteredPullRequestsData(pullRequests)}));
    } else {
      var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      settings.pullRequests = PullRequestsUtils.generateFilteredPullRequestsData(pullRequests);
      fs.writeFile(settingsFile, JSON.stringify(settings));
    }
  });
}

function getIndexedPullRequestFromMemory(indexValue) {
  var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  if (indexValue < settings.pullRequests.length) {  
    return settings.pullRequests[indexValue];
  }

  console.log('can only accept index values between 0 and ' + settings.length - 1);
}

function getPullRequest(requestNumber) {
  github.pullRequests.get({
    'user': GitUtils.getUserName(),
    'repo': GitUtils.getRepositoryName(),
    'number': requestNumber
  }, function(err, res) {
    return res;
  });
}

function getAllPullRequests(state) {
  github.pullRequests.getAll({
    'user': GitUtils.getUserName(),
    'repo': 'programmingProblems',
    'state': state
  }, function(err, res) {
    writePullRequests(res);
    logAllPullRequests(res);
  });
}

function getAllPullRequestComments(number) {
  github.pullRequests.getComments({
    'user': GitUtils.getUserName(),
    'repo': 'programmingProblems',
    'number': number
  }, function(err, res) {
    console.log(res);
  });
}

function logPullRequest(pullRequestData) {
  console.log('#' + pullRequestData['number'] + ' | ' +
               pullRequestData['title'] + ' | ' +
              pullRequestData['created_at']);
}

function getShortPullRequestDetails(pullRequestData) {
  return {
    title: pullRequestData['title'],
    number: pullRequestData['number'],
    created_at: pullRequestData['created_at']
  };
}

function pullRequests() {

  // if (!cl.closed && !cl.all) {
  //   getAllPullRequests("open");
  // }

  // if (cl.closed) {
  //   getAllPullRequests("closed");
  // }

  // if (cl.all) {
  //   getAllPullRequests("all");
  // }

  if (cl.index !== null) {
    logPullRequest((getIndexedPullRequestFromMemory(cl.number)));
  }

}

pullRequests();