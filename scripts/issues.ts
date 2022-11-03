import { fetch } from 'undici'
import { GraphQLClient } from 'graphql-request'
import fs from 'fs'
import path from 'path'
import { retry, sleep } from '@shanyue/promise-utils'

import { getSdk } from '../github/query'

global.fetch = fetch as any

const endpoint = 'https://api.github.com/graphql'

const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `bearer ${process.env.ACCESS_TOKEN}`
  }
})
const sdk = getSdk(client)

async function getIssues (after: string | undefined = undefined): Promise<any> {
  const data = await sdk.issues({
    after
  })
  const issues = data.repository?.issues
  let moreIssues = []
  if (issues?.pageInfo.endCursor) {
    moreIssues = await getIssues(issues?.pageInfo?.endCursor)
  }
  return ([...issues?.nodes || [], ...moreIssues]).filter(issue => issue.title.startsWith('【Q'))
}

retry(async (i: number) => {
  console.log('Retring ', i)
  await sleep(300)
  return getIssues()
}, { times: 100 }).then(data => {
  fs.writeFileSync(path.resolve(__dirname, '../data/issues.json'), JSON.stringify(data, null, 2))
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
