const fs = require('fs').promises;
const path = require('path');
const core = require('@actions/core');

/**
 * Reads a markdown template and interpolates values.
 * @param {string} templateName - The name of the template file without extension
 * @param {object} data - Object containing values to replace e.g. { ASSIGNEE: 'username' }
 * @param {string} workspace - The github workspace path
 * @returns {Promise<string>} The parsed template string
 */
async function renderTemplate(templateName, data, workspace) {
  try {
    const templatePath = path.join(workspace, '.github', 'comments', `${templateName}.md`);
    let content = await fs.readFile(templatePath, 'utf8');

    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value || '');
    }

    return content;
  } catch (error) {
    core.error(`Failed to load or parse template: ${templateName}`);
    throw error;
  }
}

module.exports = {
  renderTemplate
};
