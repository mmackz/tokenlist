import {
  getTokenListsFromFiles,
  getTokenListFromGit,
  getTimestamp,
  getNextVersion,
} from '../src/utils/index.js'
import fs from 'fs'
import { validate } from '../src/index.js'
import { isVersionUpdate, versionComparator } from '@uniswap/token-lists'

;(async function updateMetaData() {
  let [update, base] = getTokenListsFromFiles()

  if (!base) {
    try {
      base = await getTokenListFromGit()
    } catch (err) {
      console.error('Error fetching token list from Git:', err)
      process.exit(1)
    }
    
  }

  if (validate(update)) {
    const newVersion = getNextVersion(base, update)
    if (
      isVersionUpdate(base.version, newVersion) &&
      versionComparator(update.version, newVersion)
    ) {
      const timestamp = getTimestamp()
      update.timestamp = timestamp
      update.version = newVersion
      fs.writeFileSync('tokenlist.json', JSON.stringify(update, null, 2))
      console.log('new version: ', newVersion)
      console.log('metadata updated')
    } else {
      console.log('version is up-to-date')
    }
  } else {
    console.log('token list is not valid')
  }
})()
