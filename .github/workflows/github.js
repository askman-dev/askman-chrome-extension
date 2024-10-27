const { Octokit } = require("@octokit/rest");

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
}

module.exports = { getOrCreateIssue };
