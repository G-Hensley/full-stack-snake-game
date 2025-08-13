import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema/schema';
import { scoreResolvers } from './resolvers/scoreResolvers';
import { userResolvers } from './resolvers/userResolvers';  

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      ...userResolvers.Query,
      ...scoreResolvers.Query
    },
    Mutation: {
      ...userResolvers.Mutation,
      ...scoreResolvers.Mutation
    }
  }
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
  });
  console.log(`🚀 Server ready at ${url}`);
}

startServer();
