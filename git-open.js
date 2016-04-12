#!/usr/bin/env node

'use strict';

var shelljs = require('shelljs');
var open = require('open');

const gitBranchCommand = "git rev-parse --abbrev-ref HEAD";
const gitRemotOriginUrlCommand = "git config remote.origin.url";

function buildGitRepositoryUrl(gitBranchName, gitBaseUrl) {
  if ("master" == gitBranchName) {
    return gitBaseUrl;
  }
  return gitBaseUrl + gitBranchName;
}

function getGitBranchName() {
  var branchName = shelljs.exec(gitBranchCommand).stdout;
  return branchName.trim();
}

function getGitRemoteOriginUrl() {
  var remoteOriginUrl = shelljs.exec(gitRemotOriginUrlCommand).stdout;
  return remoteOriginUrl.trim();
}

function getGitBaseUrl(gitRemoteOriginUrl) {
  return gitRemoteOriginUrl.substring(0, gitRemoteOriginUrl.lastIndexOf("."));
}

function openGitRepositoryPage() {
  const gitBranchName = getGitBranchName();
  const gitRemoteOriginUrl = getGitRemoteOriginUrl();
  const gitBaseUrl = getGitBaseUrl(gitRemoteOriginUrl);
  const gitRepositoryUrl = buildGitRepositoryUrl(gitBranchName, gitBaseUrl);
  open(gitRepositoryUrl);
}

openGitRepositoryPage();
