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


const http= require("http");
const { Server } = require("socket.io");



const SECRET_KEY = process.env.SECRET_KEY || 'CaterOrange';
const redis = new Redis({
  host: 'localhost',  
  port: 6379,   
});
redis.ping().then(() => {
  logger.info('Successfully connected to Redis');
}).catch(err => {
  logger.error('Redis connection failed:', err);
});

const Ajv = require("ajv");

const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false });

addFormats(ajv);

const { cartSchema,cartOrderDetailsSchema} = require("./SchemaValidator/cartschema.js"); 
const validateCart = ajv.compile(cartSchema);

const validateCartOrderDetails = ajv.compile(cartOrderDetailsSchema);
const { typeDefs, resolvers } = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes.js');
const addressRoutes = require('./routes/addressRoutes');
const eventRoutes = require('./routes/eventorderRoutes.js');
const corporateorderRoutes = require('./routes/corporateorderRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const customerRoutes = require('./routes/customerRoutes.js');

const { fetchAndInsertCSVData } = require('../products.js');
 
const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = 1;
  

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: [ 'http://localhost:3000','http://localhost:3001','http://192.168.1.48:4000'],
    origin: '*',

    methods: ["GET", "POST"]
  }
});
app.use(express.json());
app.use((req,res,next)=>{
  req.io=io;
  next();
})
app.use(cors({
 origin: [ 'https://studio.apollographql.com','http://localhost:3000','http://localhost:3001'],
 credentials: true,
 allowedHeaders: ['Authorization', 'Content-Type', 'token']
}));

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);
  
  socket.on('message', (data) => {
    console.log(`Message received: ${data}`);
  
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
app.use('/api', addressRoutes);
app.use('/api', paymentRoutes);
app.use('/api', categoryRoutes);
app.use('/api', customerRoutes);
app.use('/api', corporateorderRoutes);    
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

   app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        try {
          const token = req.headers['token'];
          if (!token) {
            logger.error("Authentication token is missing.");
            throw new Error('Authentication token is missing.');
          }

          const query = 'select customer_generated_id from customer where access_token=$1';
          const result = await client.query(query, [token]);

          if (!result.rows.length) {
            logger.error("Invalid token: No matching customer found.");
            throw new Error('Invalid token.');
          }

          const customerGeneratedId = result.rows[0].customer_generated_id;

          // 3. Check for admin OR vendor status
          const query2 = 'select isadmin, isvendor from admin where customer_generated_id=$1';
          const accessResult = await client.query(query2, [customerGeneratedId]);

          // If user exists in admin table, check their roles
          const isAdmin = accessResult.rows[0]?.isadmin || false;
          const isVendor = accessResult.rows[0]?.isvendor || false;

          // 4. Decode and verify the token
          const decoded = jwt.decode(token);
          logger.info("Decoded token:", decoded);

          const verifiedUser = jwt.verify(token, process.env.SECRET_KEY, { clockTolerance: 60 });
          logger.info("Token verified successfully:", verifiedUser);

          // 5. Return the verified user and roles in the context
          return { 
            user: verifiedUser,
            roles: {
              isAdmin,
              isVendor
            }
          };
        } catch (err) {
          if (err.name === 'TokenExpiredError') {
            logger.error("Error: Token has expired.");
            throw new Error('Token has expired. Please log in again.');
          }

          logger.error("Authentication error:", err.message);
          throw new Error(err.message || 'Authentication error');
        }
      },
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
  const amountinrupee = amount * 100
  const payload = {
    "merchantId": MERCHANT_ID,
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": 123,
    "amount": amountinrupee,
    "redirectUrl":`https://app.caterorange.com/api/redirect-url/${merchantTransactionId}?customer_id=${customer_id}&corporateorder_id=${corporateorder_id}`,
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
            const response=await axios.post('https://app.caterorange.com/api/insert-payment', paymentPayload);
            }
            if(corporateorder_id[0]==='E') 
              {
              const response=await axios.post('https://app.caterorange.com/api/insertevent-payment', paymentPayload);
              }
        res.status(200);
          } catch (error) {
            console.error("Error in sending payment data: ", error);
          }
          if(corporateorder_id[0]==='C'){
          // Redirect to success page
          res.redirect('https://app.caterorange.com/success');}
          else if(corporateorder_id[0]==='E'){
            res.redirect('https://app.caterorange.com/Esuccess'); 
          }
          // Redirect to the success page
        } else {
          res.redirect('https://app.caterorange.com/failure'); // Redirect to a failure page if needed
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

app.delete('/api/cart/clear', async (req, res) => {
  try {
    const token = req.headers['token'];

    // Verify the token
    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
      logger.info('Token verified successfully for clearing cart');
    } catch (err) {
      logger.error('Token verification failed', { error: err.message });
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const userId = verified_data.id;
    
    const cartItems = await redis.hgetall(`cart:${userId}`);
    const itemKeys = Object.keys(cartItems);
    
    await redis.del(`cart:${userId}`);
    
    req.io.emit("cartCleared", { userId, itemKeys });

    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, error: 'Failed to clear cart' });
  }
});
app.post("/api/cart/update", async (req, res) => {
  try {
    const { item, itemId } = req.body;
    console.log("req",req.body)
    const token = req.headers["token"];
    
    console.log("Request Body:", req.body);

    let parsedItem;
    try {
      parsedItem = JSON.parse(item); 
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid item format",
        error: error.message,
      });
    }

    try {
      let parsedCartOrderDetails;
      if (typeof parsedItem.cart_order_details === "string") {
        parsedCartOrderDetails = JSON.parse(parsedItem.cart_order_details); 
      } else {
        parsedCartOrderDetails = parsedItem.cart_order_details; 
      }
      console.log("Parsed cart_order_details:", parsedCartOrderDetails);
      
      const isCartOrderDetailsValid = validateCartOrderDetails(parsedCartOrderDetails);
      console.log("iscartorder",isCartOrderDetailsValid)
    
      if (!isCartOrderDetailsValid) {
        console.log("Error validation for cart order details",validateCartOrderDetails.errors)
        return res.status(400).json({
            message: 'Validation failed',
            errors: validateCartOrderDetails.errors
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "cart_order_details must be a valid JSON string",
        error: error.message,
      }).end(); 
    }

    console.log("token",token)
    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
      console.log("Verified Data:", verified_data);
      logger.info("Token verified successfully for fetching order details");
    } catch (err) {
      logger.error("Token verification failed", { error: err.message });
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const userId = verified_data.id;

    await redis.hset(`cart:${userId}`, itemId, JSON.stringify(item));
    req.io.emit("cartUpdated", { itemId, item });
    res.json({ success: true, message: "Cart updated successfully" });
  } catch (error) {
    logger.error("Error updating cart item", { error: error.message });
    res.status(500).json({ success: false, message: "Failed to update cart item" });
  }
});


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
    req.io.emit("cartUpdated", { itemId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});






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




server.listen(PORT, (err) => {
  if (err) {
  logger.error('Error starting the server:', err.message || err);
  process.exit(1); 
  } else {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  }
  });
 server.on('error', (err) => {
 logger.error('Server encountered an error:', err.message || err);
 process.exit(1);
 });
 
 
 
 
 await fetchAndInsertCSVData();
 
 } catch (err) {
 logger.error('Initialization error:', err.message);
 process.exit(1);
 }
};
  

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
