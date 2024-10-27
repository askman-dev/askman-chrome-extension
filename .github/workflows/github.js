import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.ACTIONS_TOKEN,
});

async function getOrCreateIssue(milestone) {
  try {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      milestone: milestone.number,
    });
    let hash = '#' + milestone.number
    let issue = issues.find((issue) => issue.title.includes(milestone.title));
    issue = issues.find((issue) => issue.title.includes(hash));

    if (issue) {
      await octokit.issues.update({
        owner,
        repo,
        issue_number: issue.number,
        title: 'Iteration Plan for ' + milestone.title + ' ' + hash,
        body: `Updated information for milestone: ${milestone.title}`,
      });
    } else {
      issue = await octokit.issues.create({
        owner,
        repo,
        title: 'Iteration Plan for ' + milestone.title + ' ' + hash,
        body: `New issue for milestone: ${milestone.title}`,
        milestone: milestone.number,
      });
    }

    await updateIterationPlan(issue, milestone);
  } catch (error) {
    console.error("Error in getOrCreateIssue:", error);
  }
}

async function listOpenMilestones() {
  try {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

    const { data: milestones } = await octokit.issues.listMilestones({
      owner,
      repo,
      state: 'open',
    });

    return milestones.filter(milestone => milestone.title.startsWith('2024-'));
  } catch (error) {
    console.error("Error in listOpenMilestones:", error);
  }
}

async function updateIterationPlan(issue, milestone) {
  try {
    console.info(`Updating milestone plan: ${milestone.title} `)
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      milestone: milestone.number,
      sort: 'created',
      direction: 'asc'
    });
    const issueLinks = issues.map(issue => {
      const status = issue.state === 'open' ? '[ ]' : '[x]';
      return `- ${status} [${issue.title}](${issue.html_url})`;
    }).join('\n');
    
    await octokit.issues.update({
      owner,
      repo,
      issue_number: issue.number,
      body: `Iteration Plan for milestone: ${milestone.title}\n\n${issueLinks}`,
    });
  } catch (error) {
    console.error("Error in updateIterationPlan:", error);
  }
}

(async () => {
  const milestones = await listOpenMilestones();
  for (const milestone of milestones) {
    await getOrCreateIssue(milestone);
  }
})();
