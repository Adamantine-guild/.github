const core = require('@actions/core');

/**
 * Handles checking status and merging logic.
 */
class MergeManager {
  /**
   * Initializes the MergeManager.
   * @param {import('./github')} githubApi 
   */
  constructor(githubApi) {
    this.githubApi = githubApi;
  }

  /**
   * Evaluates if PR checks are still pending/running.
   * @param {string} headSha 
   * @returns {Promise<boolean>} true if waiting, false if failed/success/no checks
   */
  async areChecksPending(headSha) {
    const status = await this.githubApi.getCombinedStatus(headSha);
    
    // state can be failure, pending, or success
    if (status.state === 'pending') {
      return true;
    }

    const checks = await this.githubApi.getCheckRuns(headSha);
    
    // If any check is not completed (queued, in_progress)
    const pendingChecks = checks.check_runs.filter(
      run => run.status !== 'completed' && run.name !== 'auto-merge'
    );

    if (pendingChecks.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Enables auto-merge for a PR.
   * @param {object} prData
   */
  async enableAutoMerge(prData) {
    core.info(`Enabling squash auto-merge for PR #${prData.number}`);
    await this.githubApi.enableAutoMerge(prData.node_id, 'SQUASH');
  }
}

module.exports = MergeManager;
