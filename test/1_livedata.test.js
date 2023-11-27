import { expect } from 'chai'
import { validate, validateTokenAddresses } from '../src/index.js'
import { versionComparator } from '@uniswap/token-lists'
import {
  getTokenListsFromFiles,
  getTokenListFromGit,
  getNextVersion,
} from '../src/utils/index.js'

describe('Live Data', async () => {
  let currentTokenList
  let previousTokenList

  before(async () => {
    const [updateTokenList, baseTokenList] = getTokenListsFromFiles()
    currentTokenList = updateTokenList
    if (!baseTokenList) {
      try {
        previousTokenList = await getTokenListFromGit()
      } catch (err) {
        console.error('Error fetching token list from Git:', err)
        process.exit(1)
      }
    } else {
      previousTokenList = baseTokenList
    }
  })

  describe('Token List Tests', async () => {
    describe('when using current tokenlist.json', () => {
      it('it will pass validation', async () => {
        const isValid = await validate(currentTokenList)
        expect(isValid).to.be.true
      })
    })

    if (previousTokenList !== undefined) {
      describe('when using previous version of tokenlist', () => {
        it('it will pass validation', async () => {
          const isValid = await validate(previousTokenList)
          expect(isValid).to.be.true
        })
      })
    }
  })

  describe('Token validation tests', async () => {
    it('should pass token validation if new tokens are added', async () => {
      const isValid = await validateTokenAddresses(
        previousTokenList,
        currentTokenList,
      )
      expect(isValid).to.be.true
    })
  })

  describe('MetaData Tests', () => {
    it('version is correct based on any changes made', async () => {
      const newVersion = getNextVersion(previousTokenList, currentTokenList)
      expect(
        versionComparator(newVersion, currentTokenList.version),
        "Version number is not correct. To fix this, run 'npm run changes' to generate metadata changes",
      ).to.equal(0)
    })
  })
})
