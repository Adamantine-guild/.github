const core = require('@actions/core');
const github = require('@actions/github');
const GitHubAPI = require('./github');
const CommentManager = require('./comments');
const MergeManager = require('./merge');
const Validator = require('./validator');
const { validateToken } = require('./utils');
const { renderTemplate } = require('./templates');

async function run() {
  try {
    const token = core.getInput('AUTO_MERGE_TOKEN', { required: true });
    validateToken(token);

    const context = github.context;

    // Step 1: Trigger checks
    if (!context.payload.pull_request) {
      core.info('This event does not have a pull request payload. Skipping.');
      return;
    }

    const prNumber = context.payload.pull_request.number;
    core.info(`Processing PR #${prNumber}`);

    const githubApi = new GitHubAPI(token);
    const commentManager = new CommentManager(githubApi);
    const mergeManager = new MergeManager(githubApi);
    const workspace = process.env.GITHUB_WORKSPACE;
    
    // Load full PR details
    const prData = await githubApi.getPullRequest(prNumber);

    const validator = new Validator(githubApi, commentManager, workspace);
    const isValid = await validator.validatePR(prData);

    if (!isValid) {
      // Terminated early (conflict, missing issue, draft, etc.)
      return;
    }

    // Step 9: Check Status
    const isPending = await mergeManager.areChecksPending(prData.head.sha);
    if (isPending) {
      core.info('✓ Waiting For Checks');
      const template = await renderTemplate('waiting-checks', { AUTHOR: prData.user.login }, workspace);
      await commentManager.postComment(prNumber, template);
      return; // Exit successfully, GitHub will trigger again later
    }

    // Check if checks failed
    // Only proceed to auto-merge if checks are not pending. GitHub's auto-merge requires branch protection.
    // If we enable auto-merge, it handles the wait for us, but the prompt says:
    // "If checks are still running... Exit successfully. GitHub will trigger the workflow again when checks complete."
    // And Step 10: Enable Auto Merge
    // Step 11: Post success comment

    core.info('✓ Auto Merge Enabled');
    await mergeManager.enableAutoMerge(prData);
    
    // We optionally post the success comment. If GitHub merges it immediately, it's fine.
    // Actually, auto-merge will wait for checks. But we just checked if they are pending.
    // If they were pending, we returned.
    // So if they are NOT pending, and it's successful, we enable auto merge, and maybe post success?
    // Wait, if we enable auto-merge here, it'll merge instantly if checks passed.
    
    const successTemplate = await renderTemplate('success', { 
      AUTHOR: prData.user.login, 
      ISSUE: prData.body.match(/(?:closes|fixes|resolves)\s+#(\d+)/i)[1] 
    }, workspace);
    
    await commentManager.postComment(prNumber, successTemplate);

  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
