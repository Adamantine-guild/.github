# Adamantine Guild Auto-Merge Action

This is a production-ready reusable GitHub Action for the Adamantine-guild GitHub organization.
It completely automates the validation and merging process while enforcing the organization's contribution rules.

## Features
- Validates that a Pull Request is linked to an open issue.
- Validates that the linked issue has an assignee.
- Validates that the PR author matches the issue assignee.
- Detects merge conflicts and block PRs.
- Supports reusable comment templates (prevents duplicate spam).
- Waits for pending checks, then automatically enables Squash Auto-Merge.

## Usage

In your repository (e.g., `guildpass-core`), create `.github/workflows/auto-merge.yml`:

```yaml
name: Auto Merge

on:
  pull_request:
    types:
      - opened
      - reopened
      - synchronize
      - edited
      - ready_for_review

jobs:
  auto-merge:
    uses: Adamantine-guild/.github/.github/workflows/auto-merge.yml@main
    secrets:
      AUTO_MERGE_TOKEN: ${{ secrets.AUTO_MERGE_TOKEN }}
```

## Setup

1. **Organization Secret**: Add a Fine-Grained Personal Access Token with read/write access to PRs and Issues as an Organization Secret named `AUTO_MERGE_TOKEN`.
2. **Branch Protection**: Ensure that the target repositories have branch protection enabled requiring status checks to pass before merging.
3. **Allow Auto-Merge**: Ensure that "Allow auto-merge" is enabled in the target repository's general settings.

## Folder Structure

```
.github/
├── actions/
│   └── auto-merge/ (The actual GitHub action)
├── comments/       (Markdown comment templates)
└── workflows/      (Reusable workflows for other repositories)
```

## Troubleshooting

- **Missing Token**: Ensure `AUTO_MERGE_TOKEN` is provided via secrets.
- **Merge Conflicts**: The bot will notify you if there are conflicts. Resolve them and push again.
- **Checks Pending**: The bot will leave a comment and silently exit. GitHub will automatically trigger auto-merge once they finish.
