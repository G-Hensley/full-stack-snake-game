"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const schema_1 = require("./schema/schema");
const scoreResolvers_1 = require("./resolvers/scoreResolvers");
const userResolvers_1 = require("./resolvers/userResolvers");
const server = new server_1.ApolloServer({
    typeDefs: schema_1.typeDefs,
    resolvers: {
        Query: {
            ...userResolvers_1.userResolvers.Query,
            ...scoreResolvers_1.scoreResolvers.Query
        },
        Mutation: {
            ...userResolvers_1.userResolvers.Mutation,
            ...scoreResolvers_1.scoreResolvers.Mutation
        }
    }
});
async function startServer() {
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
        listen: { port: 4000 }
    });
    console.log(`🚀 Server ready at ${url}`);
}
startServer();
