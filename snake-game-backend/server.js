"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const schema_1 = require("./schema");
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
};
const Mutation = {
    updateScore: (parent, { id, value }) => {
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
};
const server = new server_1.ApolloServer({
    typeDefs: schema_1.typeDefs,
    resolvers: {
        Query: resolvers.Query,
        Mutation
    }
});
async function startServer() {
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
        listen: { port: 4000 }
    });
    console.log(`🚀 Server ready at ${url}`);
}
startServer();
