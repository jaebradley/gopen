'use es6';

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

function translateCommentData(commentData) {
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
  const translatedCommentsData = {};
  commentData[0].forEach(function(commentData) {
    if (isValidComment(commentData)) {
      translatedCommentsData.push(translateCommentData(commentData));
    }
  });
  return translatedCommentsData;
}

module.exports = {
  generateTranslatedComments: function(commentsData) {
    if (isValidComments(commentsData)) {
      return translatedCommentsData(commentsData);
    }
  }
};