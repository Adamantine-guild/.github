# Adamantine-guild /.github Repository

This repository contains organization-wide GitHub configuration, reusable actions, and templates for the **Adamantine-guild** organization.

## Projects Managed
- guildpass-core
- guildpass-sdk
- guildpass-mobile
- guildpass-integrations
- guildpass-app

## Architecture
- `.github/actions/auto-merge`: Custom action for automated pull request validation and merging.
- `.github/comments`: Reusable markdown templates for automated bot comments.
- `.github/workflows`: Reusable workflows to be referenced by other repositories.

## Reusable Workflows

### Auto Merge
Provides a fully automated process that validates PRs against issues and enables auto-merge when checks pass.

To use in your project, add the following workflow file (`.github/workflows/auto-merge.yml`):

```yaml
name: Auto Merge

on:
  pull_request:
    types: [opened, reopened, synchronize, edited, ready_for_review]

jobs:
  auto-merge:
    uses: Adamantine-guild/.github/.github/workflows/auto-merge.yml@main
    secrets:
      AUTO_MERGE_TOKEN: ${{ secrets.AUTO_MERGE_TOKEN }}
```

For more details, see the [Auto-Merge Action README](actions/auto-merge/README.md).
