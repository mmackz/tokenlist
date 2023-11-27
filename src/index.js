import { diffTokenLists } from '@uniswap/token-lists'
import axios from 'axios'
import Ajv, { _ } from 'ajv'
import addFormats from 'ajv-formats'
import { chainIdMap, sleep } from './utils/index.js'
import { schema } from './schema.js'

export async function validateTokenAddresses(base, update) {
  const diff = diffTokenLists(base.tokens, update.tokens)
  if (diff.added) {
    const idx = 0
    for (const token of diff.added) {
      try {
        const { chainId, address, decimals } = token
        const networkId = chainIdMap[chainId]
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${networkId}/contract/${address}`,
        )
        await sleep(1000)
        const { decimal_place, contract_address } =
          res.data.detail_platforms[networkId]
        if (contract_address !== address.toLowerCase()) {
          throw new Error('address is invalid')
        }
        if (decimal_place !== decimals) {
          throw new Error('decimals is incorrect')
        }
        if (diff.added.length - idx > 1) {
          await sleep(5000)
        }
      } catch (error) {
        if (error.response) {
          console.log(token.name, error.response.data)
        } else {
          console.log(error.message)
          console.log('an error has occurred..')
        }
        return false
      }
    }
  }
  return true
}

export async function validate(tokenList) {
  const ajv = new Ajv({ allErrors: true, verbose: true })
  addFormats(ajv)
  const validator = ajv.compile(schema)
  const valid = validator(tokenList)
  if (validator.errors) {
    throw validator.errors.map((error) => error.message).join('\n')
  }
  return valid
}
