const github = require('@actions/github');
const core = require('@actions/core');

/**
 * GitHub API Wrapper.
 */
class GitHubAPI {
  /**
   * Initializes the GitHub API client.
   * @param {string} token 
   */
  constructor(token) {
    this.octokit = github.getOctokit(token);
    this.context = github.context;
    this.owner = this.context.repo.owner;
    this.repo = this.context.repo.repo;
  }

  /**
   * Fetches the details of an issue.
   * @param {number} issueNumber 
   * @returns {Promise<object>}
   */
  async getIssue(issueNumber) {
    try {
      const { data } = await this.octokit.rest.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber
      });
      return data;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Fetches the PR details.
   * @param {number} prNumber 
   * @returns {Promise<object>}
   */
  async getPullRequest(prNumber) {
    const { data } = await this.octokit.rest.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber
    });
    return data;
  }

  /**
   * Retrieves comments on a PR.
   * @param {number} issueNumber PR is treated as an issue for comments
   * @returns {Promise<Array>}
   */
  async getComments(issueNumber) {
    const { data } = await this.octokit.rest.issues.listComments({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber
    });
    return data;
  }

  /**
   * Creates a comment on a PR.
   * @param {number} issueNumber PR number
   * @param {string} body Comment body
   */
  async createComment(issueNumber, body) {
    await this.octokit.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      body: body
    });
  }

  /**
   * Retrieves the combined status for the PR head.
   * @param {string} ref Head commit SHA
   * @returns {Promise<object>}
   */
  async getCombinedStatus(ref) {
    const { data } = await this.octokit.rest.repos.getCombinedStatusForRef({
      owner: this.owner,
      repo: this.repo,
      ref: ref
    });
    return data;
  }
  
  /**
   * Retrieves check runs for the PR head.
   * @param {string} ref Head commit SHA
   * @returns {Promise<object>}
   */
  async getCheckRuns(ref) {
      const { data } = await this.octokit.rest.checks.listForRef({
          owner: this.owner,
          repo: this.repo,
          ref: ref
      });
      return data;
  }

  /**
   * Enables auto-merge for a PR.
   * Uses GraphQL API because REST API does not directly support enablePullRequestAutoMerge yet in Octokit v18+ without special accept headers easily, GraphQL is preferred.
   * @param {string} pullRequestId Node ID of the PR
   * @param {string} mergeMethod "SQUASH", "MERGE", or "REBASE"
   */
  async enableAutoMerge(pullRequestId, mergeMethod = 'SQUASH') {
    const query = `
      mutation($pullRequestId: ID!, $mergeMethod: PullRequestMergeMethod!) {
        enablePullRequestAutoMerge(input: {
          pullRequestId: $pullRequestId,
          mergeMethod: $mergeMethod
        }) {
          pullRequest {
            autoMergeRequest {
              enabledAt
            }
          }
        }
      }
    `;

    try {
      await this.octokit.graphql(query, {
        pullRequestId,
        mergeMethod
      });
    } catch (error) {
      core.error(`Failed to enable auto-merge: ${error.message}`);
      throw error;
    }
  }
}

module.exports = GitHubAPI;
