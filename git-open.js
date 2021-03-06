#!/usr/bin/env node

'use strict';

var shelljs = require('shelljs');
var program = require('commander');
var open = require('open');
var GitHubApi = require("github");

const gitBranchCommand = "git rev-parse --abbrev-ref HEAD";
const gitRemotOriginUrlCommand = "git config remote.origin.url";
const gitRemoteBranchesCommand = "git branch -r";
const gitHubUserIssues = "https://github.com/issues";
const gitHubPullRequests = "https://github.com/pulls";
const isGitDirectoryCommand = "git rev-parse --is-inside-work-tree";
const github = new GitHubApi({
    version: "3.0.0"
  });

function getAllPullRequests() {
  var results = github.pullRequests.getAll({
    'user': 'jaebradley',
    'repo': 'programmingProblems'
  }, function(err, res) {
    console.log(JSON.stringify(res));
  });

}

getAllPullRequests();

function isGitDirectory() {
  var gitDirectoryCheck = shelljs.exec(isGitDirectoryCommand, {silent : true})
                .stdout
                .trim();
  return "true" == gitDirectoryCheck;
}

function buildGitRepositoryUrl(gitBranchName, gitBaseUrl) {
  if ("master" == gitBranchName) {
    return gitBaseUrl;
  }
  return gitBaseUrl + "/tree/" + gitBranchName;
}

function getGitBranchName() {
  return shelljs.exec(gitBranchCommand, {silent : true})
                .stdout
                .trim();
}

function getGitRemoteOriginUrl() {
  return shelljs.exec(gitRemotOriginUrlCommand, {silent : true})
                .stdout
                .trim();
}

function parseGitRemoteOriginUrl(gitRemoteOriginUrl) {
  return gitRemoteOriginUrl.substring(gitRemoteOriginUrl.lastIndexOf("github.com") + 11, gitRemoteOriginUrl.lastIndexOf("."));
}

function getGitBaseUrl() {
  return "https://github.com/" + parseGitRemoteOriginUrl(getGitRemoteOriginUrl());
}

function parseRemoteGitBranchName(remoteGitBranchName) {
  return remoteGitBranchName.substring(remoteGitBranchName.lastIndexOf("/") + 1);
}

function getRemoteGitBranches() {
  var branchNames = [];
  shelljs.exec(gitRemoteBranchesCommand, {silent : true})
         .stdout
         .trim()
         .split("\n")
         .forEach(function(remoteBranchName) {
            branchNames.push(parseRemoteGitBranchName(remoteBranchName).trim());
          });
  return branchNames;
}

function remoteBranchExists(localGitBranchName) {
  return getRemoteGitBranches().indexOf(localGitBranchName) > -1;
}

// Main run method
function run() {

  if (!isGitDirectory()) {
    console.log("oops - not a git directory");
    return;
  }

  const gitBranchName = getGitBranchName();
  if (!remoteBranchExists(gitBranchName)) {
    console.log("remote branch doesn't exist - try pushing");
    return;
  }

  program
    .version('0.0.1')
    .option('-i --issues', 'lookup issues')
    .option('-p --pulls', 'lookup pull requests')
    .option('-a --all', 'lookup all')
    .parse(process.argv);
    
  if (!program.issues && !program.pulls) {
    open(buildGitRepositoryUrl(gitBranchName, getGitBaseUrl()));
    return;
  }

  if (program.all && program.issues) {
    open(gitHubUserIssues);
  }

  else if (program.issues) {
    open(getGitBaseUrl() + "/issues");
  }

  if (program.all && program.pulls) {
    open(gitHubPullRequests);
  }

  else if (program.pulls) {
    open(getGitBaseUrl() + "/pulls");
  }

}

// run();
