'use es6';

function isValidPullRequestsData(pullRequestsData) {
  return pullRequestsData.length == 1;
}

function isValidPullRequestData(pullRequestData) {
  return 'url' in pullRequestData &&
          'html_url' in pullRequestData &&
          'diff_url' in pullRequestData &&
          'patch_url' in pullRequestData &&
          'issue_url' in pullRequestData &&
          'number' in pullRequestData &&
          'state' in pullRequestData &&
          'locked' in pullRequestData &&
          'title' in pullRequestData &&
          'body' in pullRequestData &&
          'created_at' in pullRequestData &&
          'updated_at' in pullRequestData &&
          'closed_at' in pullRequestData &&
          'merged_at' in pullRequestData &&
          'assignee' in pullRequestData &&
          'commits_url' in pullRequestData &&
          'comments_url' in pullRequestData;
}

function translatePullRequestData(pullRequestData) {
  if (!isValidPullRequestData(pullRequestData)) {
    // throw exception
    return;
  }

  return {
    'url' : pullRequestData['url'],
    'html_url' : pullRequestData['html_url'],
    'diff_url' : pullRequestData['diff_url'],
    'patch_url' : pullRequestData['patch_url'],
    'issue_url' : pullRequestData['issue_url'],
    'number' : pullRequestData['number'],
    'state' : pullRequestData['state'],
    'locked' : pullRequestData['locked'],
    'title' : pullRequestData['title'],
    'body' : pullRequestData['body'],
    'created_at' : pullRequestData['created_at'],
    'updated_at' : pullRequestData['updated_at'],
    'closed_at' : pullRequestData['closed_at'],
    'merged_at' : pullRequestData['merged_at'],
    'assignee' : pullRequestData['assignee'],
    'commits_url' : pullRequestData['commits_url'],
    'comments_url' : pullRequestData['comments_url']
  };

}

function filterPullRequestsData(pullRequestsData) {
  if (!isValidPullRequestsData(pullRequestsData)) {
    // throw exception
    return;
  }

  const filteredPullRequestData = [];
  pullRequestsData.forEach(function(pullRequestData) {
    filteredPullRequestData.push(translatePullRequestData(pullRequestData));
  });
  return filteredPullRequestData;
}

module.exports = {
  generateFilteredPullRequestsData: function(pullRequestsData) {
    return filterPullRequestsData(pullRequestsData);
  }
};