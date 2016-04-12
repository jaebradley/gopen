#!/usr/bin/env node

'use strict';

var exec = require('child_process').exec;

function getBranchName() {
  return exec("git rev-parse --abbrev-ref HEAD");
}

console.log(getBranchName());