#!/usr/bin/env node

'use strict';

var shelljs = require('shelljs');
var open = require('open');

const gitBranchCommand = "git rev-parse --abbrev-ref HEAD";
const gitRemotOriginUrlCommand = "git config remote.origin.url";
const gitRemoteBranchesCommand = "git branch -r";

function buildGitRepositoryUrl(gitBranchName, gitBaseUrl) {
  if ("master" == gitBranchName) {
    return gitBaseUrl;
  }
  return gitBaseUrl + "/tree/" + gitBranchName;
}

function getGitBranchName() {
  return shelljs.exec(gitBranchCommand).stdout.trim();
}

function getGitRemoteOriginUrl() {
  return shelljs.exec(gitRemotOriginUrlCommand).stdout.trim();
}

function getGitBaseUrl(gitRemoteOriginUrl) {
  return gitRemoteOriginUrl.substring(0, gitRemoteOriginUrl.lastIndexOf("."));
}

function openGitRepositoryPage() {
  const gitBranchName = getGitBranchName();
  const gitRemoteOriginUrl = getGitRemoteOriginUrl();
  const gitBaseUrl = getGitBaseUrl(gitRemoteOriginUrl);
  const gitRepositoryUrl = buildGitRepositoryUrl(gitBranchName, gitBaseUrl);
  if (remoteBranchExists) {
    open(gitRepositoryUrl);
  } else {
    console.log("remote branch doesn't exist - try pushing");
  }
  
}

function parseRemoteGitBranchName(remoteGitBranchName) {
  return remoteGitBranchName.substring(remoteGitBranchName.lastIndexOf("/") + 1);
}

function getRemoteGitBranches() {
  var branchNames = [];
  shelljs.exec(gitRemoteBranchesCommand).stdout.trim().split("\n").forEach(function(remoteBranchName) {
    branchNames.push(parseRemoteGitBranchName(remoteBranchName).trim());
  });
  return branchNames;
}

function remoteBranchExists(localGitBranchName) {
  return getRemoteGitBranches().contains(localGitBranchName);
}

openGitRepositoryPage();
