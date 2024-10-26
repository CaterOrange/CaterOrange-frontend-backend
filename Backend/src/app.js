const express = require('express');
const client = require('./config/dbConfig');
const { ApolloServer } = require('apollo-server-express');
const cors=require('cors')     
const logger = require('./config/logger');
const { createTables } = require('./controller/tableController');
const { createDatabase } = require('./config/config');
require('dotenv').config();
const sha256 = require('sha256'); 

const axios = require('axios');
const uniqid = require('uniqid');
const crypto = require('crypto');
const { jwtDecode } =require('jwt-decode')
const jwt=require('jsonwebtoken')
const allRoutes = require('./routes/customerRoutes.js');
const { typeDefs, resolvers } = require('./routes/adminRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes.js');
const addressRoutes = require('./routes/addressRoutes');
const eventRoutes = require('./routes/eventorderRoutes.js');
const corporateorderRoutes = require('./routes/corporateorderRoutes.js');
const categoryRoutes= require('./routes/categoryRoutes.js');
const customerRoutes= require('./routes/customerRoutes.js');

const { fetchAndInsertCSVData } = require('../products.js');
// const { fetchAndInsertCSVData } = require('../category.js');
const app = express();
app.use(express.json());
// const corsOptions = {
//   origin: 'https://dev.caterorange.com', // Update with your frontend origin
//   optionsSuccessStatus: 200,
// };

// app.use(cors());

const allowedOrigins = [
    'https://dev.caterorange.com',
    'https://admin.caterorange.com',
    'http://localhost:3001',
    'http://localhost:3000'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));


app.use('/api',addressRoutes)    
app.use('/api',paymentRoutes)
app.use('/api',categoryRoutes);
app.use('/api',customerRoutes)

app.use('/api', corporateorderRoutes);

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
    app.use(express.json());

    app.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT}`);
      logger.info(`GraphQL endpoint: http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`);
    });
  } catch (err) {
    logger.error('Initialization error:', err.message);
    process.exit(1);
    }
  }
   


const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = 1;
  
async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  
  server.applyMiddleware({ app });
  
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
    "redirectUrl": `http://localhost:4000/api/redirect-url/${merchantTransactionId}?customer_id=${customer_id}&corporateorder_id=${corporateorder_id}`,
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
            const response=await axios.post('http://localhost:4000/api/insert-payment', paymentPayload);
            }
            if(corporateorder_id[0]==='E')
              {
              const response=await axios.post('http://localhost:4000/api/insertevent-payment', paymentPayload);
              }
        res.status(200);
          } catch (error) {
            console.error("Error in sending payment data: ", error);
          }
          if(corporateorder_id[0]==='C'){
          // Redirect to success page
          res.redirect('http://localhost:3000/success');}
          else if(corporateorder_id[0]==='E'){
            res.redirect('http://localhost:3000/Esuccess');
          }
          // Redirect to the success page
        } else {
          res.redirect('http://localhost:3000/failure'); // Redirect to a failure page if needed
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
initializeApp();
fetchAndInsertCSVData() 
app.use('/api', allRoutes);
app.use('/api',eventRoutes);


//164.52.203.128
