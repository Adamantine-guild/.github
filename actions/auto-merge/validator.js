const core = require('@actions/core');
const { extractIssueNumber } = require('./utils');
const { ISSUE_REF_REGEX } = require('./constants');
const { renderTemplate } = require('./templates');

/**
 * Validates PR rules.
 */
class Validator {
  /**
   * @param {import('./github')} githubApi 
   * @param {import('./comments')} commentManager 
   * @param {string} workspace 
   */
  constructor(githubApi, commentManager, workspace) {
    this.githubApi = githubApi;
    this.commentManager = commentManager;
    this.workspace = workspace;
  }

  /**
   * Executes validation flow.
   * @param {object} prData 
   * @returns {Promise<boolean>} true if valid, false if invalid and should terminate
   */
  async validatePR(prData) {
    const prNumber = prData.number;
    const author = prData.user.login;
    const body = prData.body;

    // Ignore Draft PRs
    if (prData.draft) {
      core.info('PR is a draft. Waiting for it to be Ready for Review.');
      return false; // Stop processing, no error
    }

    // Determine Mergeability
    if (prData.mergeable === false) {
      // Conflicts
      const template = await renderTemplate('conflict', { AUTHOR: author, ASSIGNEE: author }, this.workspace);
      await this.commentManager.postComment(prNumber, template);
      core.setFailed('Merge conflicts detected.');
      return false;
    }

    // Step 4: Locate Linked Issue
    const issueNumber = extractIssueNumber(body, ISSUE_REF_REGEX);
    if (!issueNumber) {
      const template = await renderTemplate('no-linked-issue', { AUTHOR: author }, this.workspace);
      await this.commentManager.postComment(prNumber, template);
      core.setFailed('No linked issue found.');
      return false;
    }
    core.info(`✓ Linked Issue Found: #${issueNumber}`);

    // Step 5: Retrieve Linked Issue
    const issue = await this.githubApi.getIssue(issueNumber);
    if (!issue || issue.state !== 'open') {
      core.setFailed(`Issue #${issueNumber} is either missing or closed.`);
      return false;
    }

    if (!issue.assignee && (!issue.assignees || issue.assignees.length === 0)) {
      const template = await renderTemplate('no-assignee', { AUTHOR: author, ISSUE: issueNumber }, this.workspace);
      await this.commentManager.postComment(prNumber, template);
      core.setFailed('Issue does not have an assignee.');
      return false;
    }

    // Step 6: Validate Contributor Ownership
    const assignees = issue.assignees ? issue.assignees.map(a => a.login) : [];
    if (issue.assignee && !assignees.includes(issue.assignee.login)) {
      assignees.push(issue.assignee.login);
    }

    if (!assignees.includes(author)) {
      const template = await renderTemplate('wrong-assignee', { 
        AUTHOR: author, 
        ISSUE: issueNumber, 
        ASSIGNEE: assignees[0] 
      }, this.workspace);
      await this.commentManager.postComment(prNumber, template);
      core.setFailed('PR author is not assigned to the issue.');
      return false;
    }
    core.info('✓ Contributor Validated');

    return true;
  }
}

module.exports = Validator;
