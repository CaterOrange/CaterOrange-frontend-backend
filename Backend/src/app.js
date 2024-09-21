
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const client = require('./config/dbConfig');
const cors = require('cors');
const logger = require('./config/logger');
const { createTables } = require('./controller/tableController');
const { createDatabase } = require('./config/config');
require('dotenv').config();

// Import your GraphQL schema and resolvers
const { typeDefs, resolvers } = require('./routes/adminRoutes'); // You'll need to create this file
const allRoutes = require('./routes/customerRoutes.js');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/', allRoutes);

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  
  server.applyMiddleware({ app });
  
  return server;
}

const initializeApp = async () => {
  try {
    await createDatabase();
    logger.info('Database created or already exists');

    await client.connect();
    logger.info('Connected to the Caterorange DB');

    await createTables();
    logger.info('Tables created successfully');

    const apolloServer = await startApolloServer();
    logger.info('Apollo Server started');

    app.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT}`);
      logger.info(`GraphQL endpoint: http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`);
    });
  } catch (err) {
    logger.error('Initialization error:', err.message);
    process.exit(1);
  }
};

initializeApp();
