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
            .option('-p --pullrequests <n>', 'lookup pull request with index value', parseInt)
            .option('-o --open', 'open the pull request attribute')
            .parse(process.argv);

function isIndividualCommentSpecified() {
  return typeof cl.comments !== 'undefined';
}

function shouldOpen() {
  return typeof cl.open !== 'undefined';
}

function pullRequests() {
  const user = GitUtils.getUserName();
  const repo = 'programmingProblems';
  if (typeof cl.pullrequests !== "undefined") {
    const pullRequestNumber = PullRequestsUtils.getPullRequestNumber(cl.pullrequests);
    if (!isIndividualCommentSpecified() && shouldOpen()) {
      PullRequestsUtils.logPullRequest(cl.pullrequests, true);
      return;
    } else if (!isIndividualCommentSpecified() && !shouldOpen()) {
      PullRequestsUtils.logPullRequest(cl.pullrequests, false);
      CommentsUtils.logPullRequestComments(user, repo, pullRequestNumber);
      return;
    } else if (isIndividualCommentSpecified()) {
      if (shouldOpen()) {
        CommentsUtils.logPullRequestComment(user, repo, pullRequestNumber, cl.pullrequests, true);
        return;
      } else {
        PullRequestsUtils.logPullRequest(cl.pullrequests, false);
        CommentsUtils.logPullRequestComment(user, repo, pullRequestNumber, cl.pullrequests, false);
        return;
      }
    }
  } else {
    PullRequestsUtils.logAllOpenPullRequests(user, repo);
  }

}

pullRequests();