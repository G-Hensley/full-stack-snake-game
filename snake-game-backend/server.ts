import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema/schema';
import { scoreResolvers } from './resolvers/scoreResolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      ...userResolvers.Query,
      ...gameResolvers.Query,
      ...scoreResolvers.Query
    },
    Mutation
  }
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
  });
  console.log(`🚀 Server ready at ${url}`);
}

startServer();
