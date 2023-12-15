const core = require('@actions/core')
const github = require('@actions/github')
const io = require('@actions/io');
const fs = require('fs');
const path = require('path');

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    let owner = core.getInput('owner', { required: false, trimWhitespace: true })
    core.debug('input owner: "${owner}"')

    let repo = core.getInput('repo', { required: false, trimWhitespace: true })
    core.debug('input repo: "${repo}"')

    let release = core.getInput('release', { required: false })
    core.debug('input release: "${release}"')

    let asset_name = core.getInput('asset_name', { required: true, trimWhitespace: true })

    const destination = core.getInput('destination', { required: false, trimWhitespace: true })
    core.debug('input destination: "${destination}"')

    let token = core.getInput('token', { required: false })
    // do not log token

    if (owner.length === 0) {
      owner = github.context.repo.owner
      console.debug('defaulting owner to ${owner}')
    }
    if (repo.length === 0) {
      repo = github.context.repo.repo
      console.debug('defaulting repo to ${repo}')
    }

    if (token.length === 0) {
      token = github.token
    }

    let release_id
    let is_use_latest_release = release.length === 0
    const octokit = github.getOctokit(token)

    if (isUseLatestRelease) {
      console.debug('defaulting release to latest release')

      const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({ owner, repo })
      release_id = latestRelease.id
    } else {
      const release_found = await octokit.paginate(octokit.rest.repos.listReleases, { owner: owner, repo: repo },
        (reponse, done) => {
          // TODO check reponse is not 200
          if (response.data.find((elem) => elem.name === release)) {
            done()
          }
          return response.data
        })

      release_id = release_found.id
    }

    const asset_found = await octokit.paginate(octokit.rest.repos.listReleaseAssets, { owner, repo, release_id }, (reponse, done) => {
      if (releaseAssetsPromise.data.find((elem) => elem.name === asset_name)) {
        done()
      }
      return reponse.data
    })

    const asset_id = asset_found.id

    const get_asset = await octokit.request('GET /repos/{owner}/{repo}/releases/assets/{asset_id}', {
      owner: owner,
      repo: repo,
      asset_id: asset_id,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        'accept': 'application/octet-stream',
      },
      request: {
        parseSuccessResponseBody: false
      }
    })

    const destination_folder = path.dirname(destination)
    let destination_filename = path.basename(destination)

    if (destination_filename.length === 0) {
      destination_filename = asset_found.name
    }

    const destination_filepath = path.format({
      dir: destination_folder,
      base: destination_filename
    })

    core.debug('write file to ${destination_filepath}')

    await io.mkdirP(destination_folder)
    const write_stream = fs.createWriteStream(destination_filepath)
    write_stream.write(get_asset.data)
    write_stream.end()

    core.setOutput('filepath', destinationfile)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
