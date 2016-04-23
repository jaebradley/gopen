'use es6';

const settingsFile = "/Users/jaebradley/.opengitrc.json";

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

function retrievePullRequestCommentsFromGitHub(number, callback) {
  github.pullRequests.getComments({
    'user': GitUtils.getUserName(),
    'repo': 'programmingProblems',
    'number': number
  }, function(err, res) {
    callback(res);
  });
}

function writePullRequestComments(pullRequestComments) {
  fs.stat(settingsFile, function(err) {
    const pullRequestComments = generateTranslatedComments(pullRequestComments);
    if (err) {
      fs.writeFile(settingsFile, JSON.stringify({'pullRequestComments': pullRequestComments}));
    } else {
      var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      settings.pullRequestComments = pullRequestComments;
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

function logDetailedPullRequestComment(pullRequestCommentData) {
  console.log('Diff:'.underline.red + ' ' + pullRequestCommentData.diff_hunk.green);
  console.log('Comment:'.underline.red +  ' ' +pullRequestCommentData['body'].green);
  console.log('Created At:'.underline.red +  ' ' +pullRequestCommentData['created_at'].green);
}

function logPullRequestComments(comments) {
  for (i = 0; i < comments.length; i++) {
    console.log(formatIndexedPullRequestComment(comments[i], i));
  }
}

module.exports = {
  generateTranslatedComments: function(commentsData) {
    if (isValidComments(commentsData)) {
      return translateCommentsData(commentsData);
    }
  }
};