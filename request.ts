import { GraphQLClient } from 'graphql-request'

const endpoint = 'https://api.github.com/graphql'

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: process.env.GITHUB_ACCESS_TOKEN || ''
  },
})

const ISSUES = `
  query Issues ($after: String) {
    repository (name: "Daily-Question", owner: "shfshanyue") {
      id
      issues (first: 100, after: $after, states: OPEN) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          number
          title
          body
          comments (first: 30) {
            nodes {
              id
              body
              star: reactions (content: THUMBS_UP) {
                totalCount
              }
              author {
                login
                url
              }
            }
          }
          labels (first: 5) {
            nodes {
              id
              name
            }
          }
        }
      }
    }
  }
`

async function getIssues (after: string) {
  const issues = await graphQLClient.request(ISSUES, {
    after
  }).then(data => {
    return data.data.data.repository.issues
  })
  let moreIssues = []
  if (issues.pageInfo.hasNextPage) {
    moreIssues = await getIssues(issues.pageInfo.endCursor)
  }
  return ([...issues.nodes, ...moreIssues]).filter(issue => issue.title.startsWith('【Q'))
}
