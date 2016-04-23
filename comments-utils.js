'use es6';

var GitHubApi = require("github");
var fs = require('fs');
var open = require('open');
var colors = require('colors');

const settingsFile = "/Users/jaebradley/.opengitrc.json";
const github = new GitHubApi({
    version: "3.0.0"
});

function isValidComments(commentsData) {
  return commentsData.length == 1;
}

function isValidComment(commentData) {
  return 'url' in commentData &&
         'id' in commentData &&
         'diff_hunk' in commentData &&
         'body' in commentData &&
         'created_at' in commentData &&
         'html_url' in commentData;
}

function translatedCommentData(commentData) {
  return {
    url: commentData['url'],
    id: commentData['id'],
    diff_hunk: commentData['diff_hunk'],
    body: commentData['body'],
    created_at: commentData['created_at'],
    html_url: commentData['html_url']
  };
}

function translateCommentsData(commentsData) {
  const translatedCommentsData = [];
  commentsData.forEach(function(commentData) {
    if (isValidComment(commentData)) {
      translatedCommentsData.push(translatedCommentData(commentData));
    }
  });
  return translatedCommentsData;
}

function retrievePullRequestCommentsFromGitHub(user, repo, number, callback) {
  github.pullRequests.getComments({
    'user': user,
    'repo': repo,
    'number': number
  }, function(err, res) {
      callback(res);
  });
}

function retrieveIndexedPullRequestCommentsFromGitHub(user, repo, number, index, callback) {
  github.pullRequests.getComments({
    'user': user,
    'repo': repo,
    'number': number
  }, function(err, res) {
    callback(res, index);
  });
}

function writePullRequestCommentsToMemory(comments) {
  fs.stat(settingsFile, function(err) {
    const translatedComments = translateCommentsData(comments);
    if (err) {
      fs.writeFile(settingsFile, JSON.stringify({'pullRequestComments': translatedComments}));
    } else {
      var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      settings.pullRequestComments = translatedComments;
      fs.writeFile(settingsFile, JSON.stringify(settings));
    }
  });
}

function retrieveIndexedPullRequestCommentFromMemory(index) {
  var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  if (index < settings.pullRequestComments.length) {
    return settings.pullRequestComments[index];
  }

  console.log('can only accept index values between 0 and ' + settings.length - 1);

}


function formatIndexedPullRequestComment(comment, index) {
  return index + ' | ' +
         comment['body'] + ' | ' +
         comment['created_at'];
}

function logDetailedPullRequestComment(comments, index) {
  const comment = comments[index];
  console.log('Diff:'.underline.red + ' ' + comment.diff_hunk.green);
  console.log('Comment:'.underline.red +  ' ' +comment.body.green);
  console.log('Created At:'.underline.red +  ' ' +comment.created_at.green);
}

function logPullRequestComments(comments) {
  for (i = 0; i < comments.length; i++) {
    console.log(formatIndexedPullRequestComment(comments[i], i));
  }
}

function storeAndLogComments(comments) {
  writePullRequestCommentsToMemory(comments);
  logPullRequestComments(comments);
}

function openPullRequestComment(comments, index) {
  open(comments[index].html_url);
}

module.exports = {
  generateTranslatedComments: function(commentsData) {
    if (isValidComments(commentsData)) {
      return translateCommentsData(commentsData);
    }
  },

  logPullRequestComments: function(user, repo, number) {
    console.log('Comments:'.underline.red + ' ');
    retrievePullRequestCommentsFromGitHub(user, repo, number, storeAndLogComments);
  },

  logPullRequestComment: function(user, repo, number, index, shouldOpen) {
    if (shouldOpen) {
      retrieveIndexedPullRequestCommentsFromGitHub(user, repo, number, index, openPullRequestComment);
      return;
    }

    retrieveIndexedPullRequestCommentsFromGitHub(user, repo, number, index, logDetailedPullRequestComment);
  }
};