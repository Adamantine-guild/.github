const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

/**
 * Validates whether the token is provided and stops execution if missing.
 * @param {string} token 
 * @returns {void}
 */
function validateToken(token) {
  if (!token) {
    core.setFailed('Missing required input: AUTO_MERGE_TOKEN.');
    process.exit(1); // Fail gracefully if token is missing
  }
}

/**
 * Extracts the issue number from the PR description.
 * @param {string} body - The body/description of the PR
 * @param {RegExp} regex - Regex to match issue keyword and number
 * @returns {number|null} - The parsed issue number or null
 */
function extractIssueNumber(body, regex) {
  if (!body) return null;
  const match = body.match(regex);
  return match && match[1] ? parseInt(match[1], 10) : null;
}

module.exports = {
  validateToken,
  extractIssueNumber
};
