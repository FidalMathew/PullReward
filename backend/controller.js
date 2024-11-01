const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
// struct Issue { issue_url, merged, contributor, bounty, by }

//  Issue - by one person, along wiht bounty passed to the contract

// I want to get bounrty, I'll pass PR link to the issue option. 

// github login

// -- we'll recieve PR contributor, issue_url, merged or not.. (we'll match PR contributor using Github login)

// we'll pass the PR api info and then do the below -- on chain contract
// issue-rul should match with the bounty issue url
// if merged, the contributor will get the bounty




// Extract issue number and repository details from the issue link
function parseIssueUrl(issueUrl) {
  const issueUrlParts = issueUrl.split('/');
  const owner = issueUrlParts[3];
  const repo = issueUrlParts[4];
  const issueNumber = issueUrlParts[6];
  return { owner, repo, issueNumber };
}

// Extract PR number from the PR link
function parsePrUrl(prUrl) {
  const prUrlParts = prUrl.split('/');
  return prUrlParts[6]; // Pull Request number is at the 6th position
}

async function isPRLinkedToIssueAndMerged(prUrl, issueUrl) {
  const { owner, repo, issueNumber } = parseIssueUrl(issueUrl);
  const prNumber = parsePrUrl(prUrl);

  const searchUrl = `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:pr+in:body+${issueNumber}`;

  try {
    // Search for PRs mentioning the issue number
    const response = await axios.get(searchUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    console.log('Search results:', response.data, response.status);

    // Filter PRs that mention the issue number and match the given PR
    const matchingPRs = response.data.items.find(
      item => item.number === parseInt(prNumber, 10)
    );

    // console.log('Matching PRs:', matchingPRs);

    // Check if the PR exists in the search results and is merged
    if (matchingPRs && matchingPRs.pull_request.merged_at) {
      return "5";
    } else {
      return "1";
    }
  } catch (error) {
    console.error(`Error checking PR status: ${error.message}`);
    return 0;
  }
}

// Example usage
// (async () => {
//   const prUrl = 'https://github.com/mui/material-ui/pull/44131';
//   const issueUrl = 'https://github.com/mui/material-ui/issues/44130';
// //   const token = process.env.GITHUB_TOKEN;

//   const result = await isPRLinkedToIssueAndMerged(prUrl, issueUrl);
//   console.log(result); // 1 if PR is linked and merged, otherwise 0
// })();


module.exports = {isPRLinkedToIssueAndMerged};