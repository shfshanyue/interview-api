import { ApolloServer, gql } from 'apollo-server'

const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
}`

const resolvers = {
  Query: {
    hello: () => 'world'
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
