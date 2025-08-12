import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';

const resolvers = {
  Query: {
    user: () => ({
        'id': '45454',
        'username': "JohnDoe",
        'password_hash': "hashed_password"
    }),
    scores: () => ([
        {
            'id': '12345',
            'user': {
                'id': '45454',
                'username': "JohnDoe",
                'password_hash': "hashed_password"
            },
            'value': 100
        }
    ])
  }
}

const Mutation = {
  updateScore: (parent: any, { id, value }: { id: string; value: number }) => {
    // Logic to update the score in the database
    return {
      id,
      user: {
        id: '45454',
        username: "JohnDoe",
        password_hash: "hashed_password"
      },
      value
    };
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: resolvers.Query,
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
