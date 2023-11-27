## Token List

A default token list using the format from tokenlists.org

## How to use

To add a token, open `tokenlist.json` and add another item to the list. Be careful to match the existing format, or it wont pass the test!

Any added tokens are verified using coin geckos api. If the token is not found here, it wont be able to be added to the list.

**Sample Token**
```
    {
      chainId: 1,
      address: '0x4200000000000000000000000000000000006969',
      name: 'Valid Token',
      symbol: 'VAL',
      decimals: 18,
    }
```

Once your tokens have been added, you can run `npm run changes` to update the metadata, such as timestamp and version number.

The version system works as follows:
- Major Bump if tokens are removed
- Minor Bump if tokens are added
- Patch bump if a token has been updated (name, ticker, etc.)

## commands

- `npm test`: runs complete test suite
- `npm test:mock`: runs tests with mock data
- `npm test:live`: runs tests with live dada
- `npm run lint`: runs linter
- `npm run format`: formats all files
- `npm run changes`: updates version number and timestamp