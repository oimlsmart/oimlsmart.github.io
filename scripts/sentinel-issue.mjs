#!/usr/bin/env node
/**
 * The freshness sentinel's standing-issue half. The pattern is the
 * studio repo's freshness-sentinel workflow, extracted here so the
 * report jobs stay one line and the machinery stays runnable outside
 * Actions: on any red leg the sentinel opens or updates ONE standing
 * issue with the leg evidence, and on the first full-green night after
 * a red it closes that issue with the recovery evidence, so a
 * self-healed failure never goes stale.
 *
 * Usage:
 *
 *   node scripts/sentinel-issue.mjs failure
 *   node scripts/sentinel-issue.mjs recovery
 *
 * Environment:
 *
 *   GITHUB_TOKEN       a token with issues:write on GITHUB_REPOSITORY
 *                      (Actions supplies secrets.GITHUB_TOKEN)
 *   GITHUB_REPOSITORY  owner/repo (Actions sets it for every run)
 *   SENTINEL_RUN_URL   the run's URL, carried into the issue body
 *   SENTINEL_EVIDENCE  the per-leg results, one "leg: result" line per
 *                      leg (failure mode)
 *   SENTINEL_RECOVERY  the recovery text (recovery mode)
 *   SENTINEL_DRY_RUN   set to "1" to print the would-be REST calls and
 *                      exit without touching the issue tracker
 *   SENTINEL_API_BASE  overrides the GitHub API base URL; the local
 *                      test seam (a mock server) uses it, production
 *                      runs never set it
 */

const TITLE = 'Freshness sentinel: red'
const API = process.env.SENTINEL_API_BASE || 'https://api.github.com'

const mode = process.argv[2]
if (mode !== 'failure' && mode !== 'recovery') {
  console.error('usage: node scripts/sentinel-issue.mjs <failure|recovery>')
  process.exit(2)
}

const dryRun = process.env.SENTINEL_DRY_RUN === '1'
const repo = process.env.GITHUB_REPOSITORY
const runUrl = process.env.SENTINEL_RUN_URL || '(no run URL given)'
if (!repo && !dryRun) {
  console.error('GITHUB_REPOSITORY is not set')
  process.exit(2)
}

function issueBody() {
  const legs = (process.env.SENTINEL_EVIDENCE || '(no leg evidence given)').trim()
  return [
    `The freshness-sentinel run of ${new Date().toISOString()} has at least one red leg: ${runUrl}`,
    '',
    'The leg results for this run:',
    '',
    '```',
    legs,
    '```',
    '',
    'The failing step names itself in the run log, and each leg owns its own fix:',
    '',
    '- packages-pin: the shell pin trails the npm channel; run scripts/check-shell-pin.mjs locally for the two versions, then review the release and move the exact pin forward.',
    '- provenance-probes: a live proof-map anchor no longer shows its claim, or a dated capture passed its TTL; the probe output prints the regeneration command.',
    '- demo-liveness: a walkthrough or tour deep link broke against demo.oimlsmart.org (the demo reseeds nightly); the run artifact carries the playwright report.',
    '- live-smoke: a key public route of the deployed site stopped answering 200; check the latest Pages deployment.',
    '- cross-host-links: a canonical host left the registry, or the built site failed the lychee sweep; the run artifact carries the lychee results.',
  ].join('\n')
}

function recoveryBody() {
  const note = (process.env.SENTINEL_RECOVERY || 'all legs green').trim()
  return [
    `Recovered: the freshness-sentinel run of ${new Date().toISOString()} is fully green: ${runUrl}`,
    '',
    note,
  ].join('\n')
}

async function call(method, path, payload) {
  const url = `${API}${path}`
  if (dryRun) {
    console.log(`[dry-run] ${method} ${url}`)
    if (payload) console.log(`[dry-run] body: ${JSON.stringify(payload, null, 2).slice(0, 2000)}`)
    return { ok: true, status: 0, data: null }
  }
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'oimlsmart-freshness-sentinel',
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    console.error(`GitHub API ${method} ${path} failed with HTTP ${response.status}: ${text.slice(0, 500)}`)
    process.exit(1)
  }
  return { ok: true, status: response.status, data }
}

async function findStandingIssue() {
  const { data } = await call('GET', `/repos/${repo}/issues?state=open&per_page=100`)
  if (dryRun || !data) return null
  return data.find((issue) => issue.title === TITLE && !issue.pull_request) || null
}

const standing = await findStandingIssue()

if (mode === 'failure') {
  const body = issueBody()
  if (standing) {
    console.log(`the standing issue is already open (#${standing.number}); appending this run's evidence`)
    await call('POST', `/repos/${repo}/issues/${standing.number}/comments`, { body })
  } else {
    console.log('no standing issue is open; opening one')
    const { data } = await call('POST', `/repos/${repo}/issues`, { title: TITLE, body })
    if (!dryRun && data) console.log(`opened issue #${data.number}: ${data.html_url}`)
  }
}

if (mode === 'recovery') {
  if (!standing) {
    console.log('no standing issue is open; a green night opens nothing')
  } else {
    console.log(`the standing issue #${standing.number} is open; closing it with the recovery evidence`)
    await call('POST', `/repos/${repo}/issues/${standing.number}/comments`, { body: recoveryBody() })
    await call('PATCH', `/repos/${repo}/issues/${standing.number}`, { state: 'closed' })
  }
}
