// services/apolloService.js
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('../routes/adminRoutes');

const startApolloServer = async (app) => {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });
  return server;
};

module.exports = { startApolloServer };