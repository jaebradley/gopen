#!/usr/bin/env node

'use es6';

var GitHubApi = require("github");
var GitUtils = require("./git-utils");
var PullRequestsUtils = require("./pull-requests-utils");
var CommentsUtils = require("./comments-utils");

var program = require('commander');
var fs = require('fs');
var open = require('open');
var diff2Html = require('diff2html');
var colors = require('colors');

const settingsFile = "/Users/jaebradley/.opengitrc.json";

const github = new GitHubApi({
    version: "3.0.0"
});

const cl = program
            .version('0.0.1')
            .option('-c --comments <n>', 'lookup comments for pull request with index value', parseInt)
            .option('-i --index <n>', 'lookup pull request with index value', parseInt)
            .option('-o --open', 'open the pull request attribute')
            .parse(process.argv);

// Pull Requests
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

function getAllPullRequests(state) {
  github.pullRequests.getAll({
    'user': GitUtils.getUserName(),
    'repo': 'programmingProblems',
    'state': state
  }, function(err, res) {
    writePullRequests(res);
    logPullRequests(PullRequestsUtils.generateFilteredPullRequestsData(res));
  });
}

function logPullRequest(pullRequestData, index) {
  return (index + ' | #' + pullRequestData['number'] + ' | ' +
               pullRequestData['title'] + ' | ' +
              pullRequestData['created_at']).green;
}

function logShortPullRequest(pullRequestData) {
  return ('#' + pullRequestData['number'] + ' | ' +
               pullRequestData['title'] + ' | ' +
              pullRequestData['created_at']).green;
}

function logPullRequests(pullRequestsData) {
  for (i = 0; i < pullRequestsData.length; i++) {
    console.log(logPullRequest(pullRequestsData[i], i));
  }
}

// Pull Request Comments
function getAllPullRequestComments(number) {
  github.pullRequests.getComments({
    'user': GitUtils.getUserName(),
    'repo': 'programmingProblems',
    'number': number
  }, function(err, res) {
    const translatedComments = CommentsUtils.generateTranslatedComments(res);
    writePullRequestComments(translatedComments);
    logPullRequestComments(translatedComments);
  });
}

function getPullRequestComment(number, index) {
  github.pullRequests.getComments({
    'user': GitUtils.getUserName(),
    'repo': 'programmingProblems',
    'number': number
  }, function(err, res) {
    const translatedComments = CommentsUtils.generateTranslatedComments(res);
    writePullRequestComments(translatedComments);
    logDetailedPullRequestComment(translatedComments[index]);
  });
}

function openPullRequestComment(number, index) {
  github.pullRequests.getComments({
    'user': GitUtils.getUserName(),
    'repo': 'programmingProblems',
    'number': number
  }, function(err, res) {
    const translatedComments = CommentsUtils.generateTranslatedComments(res);
    open(translatedComments[index].html_url);
  });
}

function writePullRequestComments(pullRequestComments) {
  fs.stat(settingsFile, function(err) {
    if (err) {
      fs.writeFile(settingsFile, JSON.stringify({'pullRequestComments': CommentsUtils.generateTranslatedComments(pullRequestComments)}));
    } else {
      var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      settings.pullRequestComments = CommentsUtils.generateTranslatedComments(pullRequestComments);
      fs.writeFile(settingsFile, JSON.stringify(settings));
    }
  });
}

function getIndexedPullRequestCommentFromMemory(indexValue) {
  var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  if (indexValue < settings.pullRequestComments.length) {
    return settings.pullRequestComments[indexValue];
  }

  console.log('can only accept index values between 0 and ' + settings.length - 1);
}

function logPullRequestComment(pullRequestCommentData, index) {
  console.log((index + ' | ' + pullRequestCommentData['body'] + ' | ' + pullRequestCommentData['created_at']).green);
}

function logDetailedPullRequestComment(pullRequestCommentData) {
  console.log('Diff:'.underline.red + ' ' + pullRequestCommentData.diff_hunk.green);
  console.log('Comment:'.underline.red +  ' ' +pullRequestCommentData['body'].green);
  console.log('Created At:'.underline.red +  ' ' +pullRequestCommentData['created_at'].green);
}

function logPullRequestComments(pullRequestCommentsData) {
  for (i = 0; i < pullRequestCommentsData.length; i++) {
    logPullRequestComment(pullRequestCommentsData[i], i);
  }
}

function getShortPullRequestDetails(pullRequestData) {
  return {
    title: pullRequestData['title'],
    number: pullRequestData['number'],
    created_at: pullRequestData['created_at']
  };
}

function pullRequests() {

  if (typeof cl.index !== "undefined") {
    console.log("Pull Request:".underline.red +  ' ' + logShortPullRequest(getIndexedPullRequestFromMemory(cl.index)));
    const pullRequestUrl = getIndexedPullRequestFromMemory(cl.index).html_url;
    const pullRequestNumber = getShortPullRequestDetails(getIndexedPullRequestFromMemory(cl.index)).number;
    if (typeof cl.comments !== "undefined") {
      if (typeof cl.open !== "undefined") {
        openPullRequestComment(pullRequestNumber, cl.comments);
      } else {
        getPullRequestComment(pullRequestNumber, cl.comments);
      }
    } else {
      if (typeof cl.open !== "undefined") {
        open(pullRequestUrl);
      } else {
        console.log("Comments:".underline.red + ' ');
        getAllPullRequestComments(pullRequestNumber);  
      }
    }
  } else {
    console.log("Pull Requests:".underline.red + ' ');
    getAllPullRequests("open");
  }

}

pullRequests();