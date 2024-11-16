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
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',  
  port: 6379,   
});
redis.ping().then(() => {
  logger.info('Successfully connected to Redis');
}).catch(err => {
  logger.error('Redis connection failed:', err);
});
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
 origin: ['https://admin.caterorange.com', 'https://dev.caterorange.com', 'https://studio.apollographql.com','http://localhost:3000','http://localhost:8081'],
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
app.post("/api/pay", async(req, res) => {
  const payEndpoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const {amount,corporateorder_id } = req.body;
  console.log("hello")
  const token = req.headers["token"]
  const decode = jwt.decode(token);
  console.log(decode);
  console.log(amount)
  const customer_id = decode.id;
  // console.log(token)
  // const response = await customerController.getuserbytoken({ body: { access_token: token } })
  // console.log(response)
  // const customer_id = response.customer_id
  // console.log(customer_id)
  const amountinrupee = amount * 100
  const payload = {
    "merchantId": MERCHANT_ID,
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": 123,
    "amount": amountinrupee,
    "redirectUrl": `https://dev.caterorange.com/api/redirect-url/${merchantTransactionId}?customer_id=${customer_id}&corporateorder_id=${corporateorder_id}`,
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
  console.log("1")
  axios
    .request(options)
    .then(function (response) {
        console.log("2")
      console.log(response.data);
      const url = response.data.data.instrumentResponse.redirectInfo.url;
      res.json({ redirectUrl: url }); 
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send(error.message);
    });
});

app.get('/api/redirect-url/:merchantTransactionId', async(req, res) => {
  const { merchantTransactionId } = req.params;
  const { customer_id, corporateorder_id  } = req.query;
  console.log(customer_id)
  console.log('The merchant Transaction id is', merchantTransactionId);
  if (merchantTransactionId) {
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
    axios
      .request(options)
      .then(async function (response) {
        console.log(response.data);
        if (response.data.code === 'PAYMENT_SUCCESS') {
          const paymentData = response.data.data;
          const paymentInstrument = paymentData.paymentInstrument;
         
          const paymentPayload = {
            paymentType: paymentInstrument.type, // PaymentType
            merchantTransactionId: paymentData.merchantTransactionId, // MerchantReferenceId
            phonePeReferenceId: paymentData.transactionId, // PhonePeReferenceId
            paymentFrom: "PhonePe", // From
            instrument: paymentInstrument.cardType || 'N/A', // Instrument (CARD or other)
            bankReferenceNo: paymentInstrument.brn || 'N/A', // BankReferenceNo
            amount: paymentData.amount,
            customer_id,corporateorder_id// Amount
             // Replace this with the actual customer_id (from session or request)
          };
         console.log("Checking vcvvcvcbch",corporateorder_id[0])
          // Make an Axios POST request to the new API for inserting the payment
          try {
            if(corporateorder_id[0]==='C')
            {
            const response=await axios.post('https://dev.caterorange.com/api/insert-payment', paymentPayload);
            }
            if(corporateorder_id[0]==='E')
              {
              const response=await axios.post('https://dev.caterorange.com/api/insertevent-payment', paymentPayload);
              }
        res.status(200);
          } catch (error) {
            console.error("Error in sending payment data: ", error);
          }
          if(corporateorder_id[0]==='C'){
          // Redirect to success page
          res.redirect('https://dev.caterorange.com/success');}
          else if(corporateorder_id[0]==='E'){
            res.redirect('https://dev.caterorange.com/Esuccess');
          }
          // Redirect to the success page
        } else {
          res.redirect('https://dev.caterorange.com/failure'); // Redirect to a failure page if needed
        }
      })
      .catch(function (error) {  
        console.error(error);
        res.status(500).send(error.message);
      });
  } else {
    res.status(400).send({ error: 'Error' });     
  }
});
    


app.get('/api/cart', async (req, res) => {
  try {
    const token = req.headers['token']

    let verified_data;
    
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
      logger.info('Token verified successfully for fetching order details');
    } catch (err) {
      logger.error('Token verification failed', { error: err.message });
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    console.log(verified_data)
    const userId = verified_data.id;
    const cartItems = await redis.hgetall(`cart:${userId}`);
    res.json(cartItems);  
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Update cart item
app.post('/api/cart/update', async (req, res) => {
  try {
    
    const {itemId, item } = req.body;
    const token = req.headers['token']

    let verified_data;
    
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
      logger.info('Token verified successfully for fetching order details');
    } catch (err) {
      logger.error('Token verification failed', { error: err.message });
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    console.log(verified_data)
    const userId = verified_data.id;
    console.log(userId)
    await redis.hset(`cart:${userId}`, itemId, JSON.stringify(item));
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove cart item
app.delete('/api/cart/:itemId', async (req, res) => {
  try {
    const {  itemId } = req.params;
    const token = req.headers['token']

    let verified_data;
    
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
      logger.info('Token verified successfully for fetching order details');
    } catch (err) {
      logger.error('Token verification failed', { error: err.message });
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    console.log(verified_data)
    const userId = verified_data.id;
    await redis.hdel(`cart:${userId}`, itemId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
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
 process.exit(1); // Exit the process if the server fails to start
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

module.exports={app};
