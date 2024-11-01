const express = require('express');
const client = require('./config/dbConfig');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const logger = require('./config/logger');
const { createTables } = require('./controller/tableController');
const { createDatabase } = require('./config/config');
require('dotenv').config();
const sha256 = require('sha256');
const axios = require('axios');
const uniqid = require('uniqid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Route imports
const allRoutes = require('./routes/customerRoutes.js');
const { typeDefs, resolvers } = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes.js');
const addressRoutes = require('./routes/addressRoutes');
const eventRoutes = require('./routes/eventorderRoutes.js');
const corporateorderRoutes = require('./routes/corporateorderRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const customerRoutes = require('./routes/customerRoutes.js');

const { fetchAndInsertCSVData } = require('../products.js');
   
// Constants for PhonePe
const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = 1;


const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://admin.caterorange.com', 'https://dev.caterorange.com', 'https://studio.apollographql.com'],
  credentials: true
}));

// Route middleware
app.use('/api', addressRoutes);
app.use('/api', paymentRoutes);
app.use('/api', categoryRoutes);
app.use('/api', customerRoutes);
app.use('/api', corporateorderRoutes);
app.use('/api', allRoutes);
app.use('/api', eventRoutes);

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      logger.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        path: error.path,
      };
    },
  });

  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        token: req.headers.authorization,
      }),
    })
  );

  return server;
}

// Payment endpoint
app.post("/api/pay", async(req, res) => {
  const payEndpoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const { amount, corporateorder_id } = req.body;
  
  const token = req.headers["token"];
  const decode = jwt.decode(token);
  const customer_id = decode.id;
  const amountinrupee = amount * 100;

  const payload = {
    "merchantId": MERCHANT_ID,
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": 123,
    "amount": amountinrupee,
    "redirectUrl": `https://dev.caterorange.com/redirect-url/${merchantTransactionId}?customer_id=${customer_id}&corporateorder_id=${corporateorder_id}`,
    "redirectMode": "REDIRECT",
    "callbackUrl": "https://webhook.site/callback-url",
    "mobileNumber": "9999999999",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  };

  const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
  const base64EncodedPayload = bufferObj.toString("base64");

  const xVerify = crypto
    .createHash('sha256')
    .update(base64EncodedPayload + payEndpoint + SALT_KEY)
    .digest('hex') + "###" + SALT_INDEX;

  const options = {
    method: 'post',
    url: PHONEPE_HOST_URL + payEndpoint,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      "X-VERIFY": xVerify
    },
    data: {
      request: base64EncodedPayload
    }
  };

  try {
    const response = await axios.request(options);
    const url = response.data.data.instrumentResponse.redirectInfo.url;
    res.json({ redirectUrl: url });
  } catch (error) {
    logger.error('Payment error:', error);
    res.status(500).send(error.message);
  }
});

// Redirect URL endpoint
app.get('/api/redirect-url/:merchantTransactionId', async(req, res) => {
  const { merchantTransactionId } = req.params;
  const { customer_id, corporateorder_id } = req.query;

  if (!merchantTransactionId) {
    return res.status(400).send({ error: 'Missing merchantTransactionId' });
  }

  const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + '###' + SALT_INDEX;
  
  const options = {
    method: 'get',
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      "X-MERCHANT-ID": MERCHANT_ID,
      "X-VERIFY": xVerify
    },
  };

  try {
    const response = await axios.request(options);
    
    if (response.data.code === 'PAYMENT_SUCCESS') {
      const paymentData = response.data.data;
      const paymentInstrument = paymentData.paymentInstrument;
      
      const paymentPayload = {
        paymentType: paymentInstrument.type,
        merchantTransactionId: paymentData.merchantTransactionId,
        phonePeReferenceId: paymentData.transactionId,
        paymentFrom: "PhonePe",
        instrument: paymentInstrument.cardType || 'N/A',
        bankReferenceNo: paymentInstrument.brn || 'N/A',
        amount: paymentData.amount,
        customer_id,
        corporateorder_id
      };

      if (corporateorder_id[0] === 'C') {
        await axios.post('https://dev.caterorange.com/api/insert-payment', paymentPayload);
        res.redirect('https://dev.caterorange.com/success');
      } else if (corporateorder_id[0] === 'E') {
        await axios.post('https://dev.caterorange.com/api/insertevent-payment', paymentPayload);
        res.redirect('https://dev.caterorange.com/Esuccess');
      }
    } else {
      res.redirect('https://dev.caterorange.com/failure');
    }
  } catch (error) {
    logger.error('Redirect error:', error);
    res.status(500).send(error.message);
  }
});

// Initialize application
const initializeApp = async () => {
  try {
    await createDatabase();
    logger.info('Database created or already exists');

    await client.connect();
    logger.info('Connected to the Caterorange DB');

    await createTables();
    logger.info('Tables created successfully');

    await startApolloServer();
    logger.info('Apollo Server started');
 
    const PORT = process.env.PORT || 4000; 

    const server = app.listen(PORT, (err) => {
      if (err) {
        logger.error('Error starting the server:', err.message || err);
        process.exit(1);  // Exit the process if the server fails to start
      } else {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
      }
    });
    
    // Listen for server errors (like port binding issues)
    server.on('error', (err) => {
      logger.error('Server encountered an error:', err.message || err);
      process.exit(1);
    });
    
    
    
    
    // Initialize data
    await fetchAndInsertCSVData();
    
  } catch (err) {
    logger.error('Initialization error:', err.message);
    process.exit(1);
  }
};

// Error handling
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

initializeApp();
