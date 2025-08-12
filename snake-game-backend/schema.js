"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
exports.typeDefs = `
  type User {
    id: ID!
    username: String!
    password_hash: String!
  }

  type Score {
    id: ID!
    user: User!
    value: Int!
  }

  type Mutation {
    createUser(username: String!, password: String!): User!
    createScore(userId: ID!, value: Int!): Score!
    login(username: String!, password: String!): String! # Returns a JWT token
    updateScore(id: ID!, value: Int!): Score!
  }

  type Query {
    user: User!
    scores: [Score!]! 
  }
`;
