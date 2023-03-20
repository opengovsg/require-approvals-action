import * as core from '@actions/core'
import * as github from '@actions/github'

const isStrictMode = core.getBooleanInput('is-strict-mode', { required: true })
const githubToken = core.getInput('github-token', { required: true })

const octokit = github.getOctokit(githubToken)

function setToString<T>(s: Set<T>): string {
  return Array.from(s).join(',')
}

async function run() {
  core.debug(`Payload: ${JSON.stringify(github.context.payload)}`)

  if (!github.context.payload.pull_request) {
    if (isStrictMode) {
      core.setFailed('Must run against a pull request!')
    } else {
      core.setOutput('status', 'success')
    }
    return
  }

  const reviews = (
    await octokit.rest.pulls.listReviews({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request?.number,
    })
  ).data
  core.debug(`Reviews: ${JSON.stringify(reviews)}`)

  const approvals = new Set<string>()
  for (const review of reviews) {
    if (!review.user) continue

    if (review.state === 'APPROVED') {
      core.debug(
        `Adding \`${review.user.login}\` to (${setToString(approvals)})`,
      )

      approvals.add(review.user.login)
    } else if (review.state === 'CHANGES_REQUESTED') {
      core.debug(
        `Removing \`${review.user.login}\` from (${setToString(approvals)})`,
      )

      approvals.delete(review.user.login)
    }
  }

  core.setOutput('status', approvals.size > 0 ? 'success' : 'failure')
  core.debug(`Final \`approvals\` value: (${setToString(approvals)})`)
}

void run()
