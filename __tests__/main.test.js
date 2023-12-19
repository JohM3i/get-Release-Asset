/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const main = require('../src/main')
const io = require('@actions/io')
const github = require('@actions/github')

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation((reason) => { console.log(reason) })
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
//const octokitMock = jest.spyOn(github, 'getOctokit').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

const token = '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'

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  //it('sets the time output', async () => {
  //  // Set the action's inputs as return values from core.getInput()
  //  getInputMock.mockImplementation(name => {
  //    switch (name) {
  //      case 'milliseconds':
  //        return '500'
  //      default:
  //        return ''
  //    }
  //  })
  //
  //  await main.run()
  //  expect(runMock).toHaveReturned()
  //
  //  // Verify that all of the core library functions were called correctly
  //  expect(debugMock).toHaveBeenNthCalledWith(1, 'Waiting 500 milliseconds ...')
  //  expect(debugMock).toHaveBeenNthCalledWith(
  //    2,
  //    expect.stringMatching(timeRegex)
  //  )
  //  expect(debugMock).toHaveBeenNthCalledWith(
  //    3,
  //    expect.stringMatching(timeRegex)
  //  )
  //  expect(setOutputMock).toHaveBeenNthCalledWith(
  //    1,
  //    'time',
  //    expect.stringMatching(timeRegex)
  //  )
  //})
  //
  //it('sets a failed status', async () => {
  //  // Set the action's inputs as return values from core.getInput()
  //  getInputMock.mockImplementation(name => {
  //    switch (name) {
  //      case 'milliseconds':
  //        return 'this is not a number'
  //      default:
  //        return ''
  //    }
  //  })
  //
  //  await main.run()
  //  expect(runMock).toHaveReturned()
  //
  //  // Verify that all of the core library functions were called correctly
  //  expect(setFailedMock).toHaveBeenNthCalledWith(
  //    1,
  //    'milliseconds not a number'
  //  )
  //})
  //
  //it('fails if no input is provided', async () => {
  //  // Set the action's inputs as return values from core.getInput()
  //  getInputMock.mockImplementation(name => {
  //    switch (name) {
  //      case 'milliseconds':
  //        throw new Error('Input required and not supplied: milliseconds')
  //      default:
  //        return ''
  //    }
  //  })
  //
  //  await main.run()
  //  expect(runMock).toHaveReturned()
  //
  //  // Verify that all of the core library functions were called correctly
  //  expect(setFailedMock).toHaveBeenNthCalledWith(
  //    1,
  //    'Input required and not supplied: milliseconds'
  //  )
  //})

  it('success latest release', async () => {
    process.env.GITHUB_REPOSITORY = 'owner/repo'
    process.env.TOKEN = token //'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'
    github.token = token //process.env.TOKEN
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'asset_name':
          return 'asset_name'
        case 'token':
          return token //'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'
        default:
          return ''
      }
    })

    const octokit = github.getOctokit('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')

    const latestRelease = () =>
      new Promise((resolve, reject) => {
        resolve({ status: 200, data: { id: 1 } })
      })
    jest
      .spyOn(octokit.rest.repos, 'getLatestRelease')
      .mockImplementation(latestRelease)

    const listReleasAssets = () =>
      new Promise((resolve, reject) => {
        resolve({ status: 200, data: [{ asset_name: 'asset_name' }] })
      })
    jest
      .spyOn(octokit.rest.repos, 'listReleaseAssets')
      .mockImplementation(listReleasAssets)

    const getReleaseAsset = () =>
      new Promise((resolve, reject) => {
        resolve({
          status: 200,
          data: { browser_download_url: 'https://localhost.com' }
        })
      })

    jest
      .spyOn(octokit.rest.repos, 'getReleaseAsset')
      .mockImplementation(getReleaseAsset)
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledTimes(0)
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'https://localhost.com')
  })
})
