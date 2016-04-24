#!/usr/bin/env node

'use es6';

var GitUtils = require("./git-utils");
var PullRequestsUtils = require("./pull-requests-utils");
var CommentsUtils = require("./comments-utils");

var program = require('commander');

const cl = program
            .version('0.0.1')
            .option('-c --comments <i>', 'lookup comments for pull request with index value', parseInt)
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
  const repo = GitUtils.getRepositoryName();
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
        CommentsUtils.logPullRequestComment(user, repo, pullRequestNumber, cl.comments, true);
        return;
      } else {
        PullRequestsUtils.logPullRequest(cl.pullrequests, false);
        CommentsUtils.logPullRequestComment(user, repo, pullRequestNumber, cl.comments, false);
        return;
      }
    }
  } else {
    PullRequestsUtils.logAllOpenPullRequests(user, repo);
  }

}

pullRequests();