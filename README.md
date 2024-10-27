# 开发
pnpm run dev

## GitHub Actions Workflow: Create or Update Iteration Plan

This repository includes a GitHub Actions workflow that creates or updates an issue when a milestone or issue event occurs.

### Events that Trigger the Workflow

The workflow is triggered by the following events:
- Milestone events: created, closed, edited, opened
- Issue events: opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled, locked, unlocked, milestoned, demilestoned

### Purpose of the Workflow

The purpose of this workflow is to automate the creation or updating of issues related to milestones and issues in the repository. It ensures that relevant information is captured and maintained in the issues, providing better tracking and management of milestones and issues.
