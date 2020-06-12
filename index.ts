import { ApolloServer, gql } from 'apollo-server'
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
    ): [Question!]
    question (id: ID!): Question
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
    questions ({}, { label, topic, limit, random }: {
      label?: string;
      topic?: string;
      limit?: number;
      random?: boolean;
    }) {
      const q = _.filter(allQuestions, _.pick({ label, topic }))
      if (random) {
        return _.sampleSize(q, limit)
      }
      return q.slice(0, limit || 1000)
    },
    question ({}, { id }: { id: number }) {
      return questionsById[id]
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
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
