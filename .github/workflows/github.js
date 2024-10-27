import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function getOrCreateIssue(milestone) {
  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  const repo = process.env.GITHUB_REPOSITORY;

  // Search for existing issues related to the milestone
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    milestone: milestone.number,
  });

  // Check if an issue for the milestone already exists
  let issue = issues.find((issue) => issue.title.includes(milestone.title));

  if (issue) {
    // Update the existing issue with new information
    await octokit.issues.update({
      owner,
      repo,
      issue_number: issue.number,
      title: milestone.title,
      body: `Updated information for milestone: ${milestone.title}`,
    });
  } else {
    // Create a new issue if no existing issue is found
    await octokit.issues.create({
      owner,
      repo,
      title: milestone.title,
      body: `New issue for milestone: ${milestone.title}`,
      milestone: milestone.number,
    });
  }

  // Update the Iteration Plan issue with a list of issue links
  await updateIterationPlan(issue, milestone);
}

async function listOpenMilestones() {
  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  const repo = process.env.GITHUB_REPOSITORY;

  const { data: milestones } = await octokit.issues.listMilestones({
    owner,
    repo,
    state: 'open',
  });

  const filteredMilestones = milestones.filter(milestone => milestone.title.startsWith('2024-'));

  return filteredMilestones;
}

async function updateIterationPlan(issue, milestone) {
  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  const repo = process.env.GITHUB_REPOSITORY;

  // Fetch all issues related to the specific milestone
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    milestone: milestone.number,
  });

  // Create a list of links to these issues
  const issueLinks = issues.map(issue => `- [${issue.title}](${issue.html_url})`).join('\n');

  // Update the body of the Iteration Plan issue with this list
  await octokit.issues.update({
    owner,
    repo,
    issue_number: issue.number,
    body: `Iteration Plan for milestone: ${milestone.title}\n\n${issueLinks}`,
  });
}
listOpenMilestones();
getOrCreateIssue();
updateIterationPlan();

export { getOrCreateIssue, listOpenMilestones, updateIterationPlan };
