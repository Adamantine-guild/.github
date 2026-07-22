/**
 * Centralized constants used across the action
 */

module.exports = {
  // Regex pattern to extract issue references like "Closes #123"
  ISSUE_REF_REGEX: /(?:closes|fixes|resolves)\s+#(\d+)/i,

  // GitHub Actions Event Types that trigger this workflow
  SUPPORTED_EVENTS: [
    'pull_request.opened',
    'pull_request.reopened',
    'pull_request.synchronize',
    'pull_request.edited',
    'pull_request.ready_for_review'
  ],

  // Comment Signature to identify bot comments
  COMMENT_SIGNATURE: '<!-- ADAMANTINE_AUTO_MERGE_BOT -->',

  // Valid Merge Methods
  MERGE_METHOD_SQUASH: 'squash'
};
