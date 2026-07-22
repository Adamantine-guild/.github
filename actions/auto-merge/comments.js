const core = require('@actions/core');
const { COMMENT_SIGNATURE } = require('./constants');

/**
 * Handles commenting logic, ensuring no duplicate comments.
 */
class CommentManager {
  /**
   * Initializes the CommentManager.
   * @param {import('./github')} githubApi 
   */
  constructor(githubApi) {
    this.githubApi = githubApi;
  }

  /**
   * Posts a comment if it hasn't been posted before.
   * @param {number} prNumber 
   * @param {string} body 
   */
  async postComment(prNumber, body) {
    const fullBody = `${body}\n\n${COMMENT_SIGNATURE}`;

    const comments = await this.githubApi.getComments(prNumber);
    const hasPosted = comments.some(comment => 
      comment.user.type === 'Bot' && comment.body.includes(body.trim()) && comment.body.includes(COMMENT_SIGNATURE)
    );

    if (hasPosted) {
      core.info('Comment already posted. Skipping to prevent duplicates.');
      return;
    }

    core.info('Posting new comment...');
    await this.githubApi.createComment(prNumber, fullBody);
  }
}

module.exports = CommentManager;
