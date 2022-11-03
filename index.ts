import { ApolloServer, gql } from 'apollo-server-express'
import express from 'express'
import _ from 'lodash'

import issues from './data/issues.json'
import { Issue, IssueComment } from './github/query'
import { labels } from './labes'

const allQuestions: Array<Issue> = issues as any
const questionsById = _.keyBy(allQuestions, 'number')
const labelsByName = _.keyBy(labels, 'name')

const typeDefs = gql`
  enum Topic {
    FE
    SERVER
    DEVOPS
    OPEN
    BASE
  }

  type Query {
    questions (
      label: String
      topic: Topic
      limit: Int
      random: Boolean
      withAnswer: Boolean
    ): [Question!]
    question (
      number: Int
      label: String
      topic: Topic
      limit: Int
      random: Boolean
      withAnswer: Boolean
    ): Question
  }

  type Question {
    id: ID!
    number: Int!
    title: String!
    body: String!
    labels (alias: Boolean): [String!]
    topics: [Topic!]
    answers: [Answer!]
    selfAnswer: Answer
  }

  type Answer {
    id: ID!
    body: String!
    star: Int!
    author: String!
  }
`

const resolvers = {
  Topic: {
    FE: 'fe',
    SERVER: 'server',
    DEVOPS: 'devops',
    OPEN: 'open',
    BASE: 'base'
  },
  Query: {
    questions ({}, { label, topic, limit, random, withAnswer }: {
      label?: string;
      topic?: string;
      limit?: number;
      random?: boolean;
      withAnswer?: boolean;
    }) {
      const q = _.filter(allQuestions, _.pick({ label, topic })).filter(qq => {
        const question: Issue = qq as any
        return withAnswer ? question.comments.nodes?.find(comment => {
          return comment?.author?.login === 'shfshanyue'
        }) : true
      })
      if (random) {
        return _.sampleSize(q, limit)
      }
      return q.slice(0, limit || 1000)
    },
    question ({}, { number, label, topic, random, withAnswer }: {
      label?: string;
      topic?: string;
      random?: boolean;
      withAnswer?: boolean;
      number?: number
    }) {
      if (number) {
        return questionsById[number]
      }
      const q = _.filter(allQuestions, _.pick({ label, topic })).filter(qq => {
        const question: Issue = qq as any
        return withAnswer ? question.comments.nodes?.find(comment => {
          return comment?.author?.login === 'shfshanyue'
        }) : true
      })
      return _.sample(q)
    }
  },
  Question: {
    labels (question: Issue, { alias }: { alias?: boolean } = {}) {
      return _.compact(question.labels?.nodes?.map(x => {
        const name = x?.name
        return name && alias ? labelsByName[name]?.alias || name : name
      }))
    },
    topics (question: Issue) {
      return resolvers.Question.labels(question)?.map(x => labelsByName[x]?.group || 'fe')
    },
    answers (question: Issue) {
      return question.comments.nodes
    },
    selfAnswer (question: Issue) {
      return question.comments.nodes?.find(comment => {
        return comment?.author?.login === 'shfshanyue'
      })
    }
  },
  Answer: {
    star (answer: any) {
      return answer.star?.totalCount || 0
    },
    author (answer: IssueComment) {
      return answer.author?.login
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  rootValue: {},
  formatError (e) {
    console.error(e.originalError)
    return e
  }
})
const app = express()

server.start().then(() => {
  server.applyMiddleware({ app })
})


// app.use('/', (req, res) => {
//   res.send('hello, shanyue.')
// })

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)

// 为了与腾讯云的 express component 适配
module.exports = app
