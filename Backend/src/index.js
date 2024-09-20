const express = require('express');
const port = 5000;
const sha256 = require('sha256');
const app = express();
const axios = require('axios');
const uniqid = require('uniqid');
const crypto = require('crypto');
app.use(express.json());
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000' 
  }));
const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = 1;

app.post("/pay", (req, res) => {
  const payEndpoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const { userid, amount } = req.body;
  console.log("hello")
  const amountinrupee = amount * 100
  const payload = {
    "merchantId": MERCHANT_ID,
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": userid,
    "amount": amountinrupee,
    "redirectUrl": `http://localhost:5000/redirect-url/${merchantTransactionId}`,
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

app.get('/redirect-url/:merchantTransactionId', (req, res) => {
  const { merchantTransactionId } = req.params;
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
      .then(function (response) {
        console.log(response.data);
        if (response.data.code === 'PAYMENT_SUCCESS') {
          res.redirect('http://localhost:3000/success'); // Redirect to the success page
        } else if(response.data.code === 'PAYMENT_FAILURE') {
          res.redirect('http://localhost:3000/failure'); // Redirect to a failure page if needed
        }
        else if(response.data.code === 'PAYMENT_CANCELED') {
          res.redirect('http://localhost:3000/cancel'); // Redirect to a failure page if needed
        }
        else{
          res.redirect('http://localhost:3000/pending'); // Redirect to a failure page if needed

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

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
