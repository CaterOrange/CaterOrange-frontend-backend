const express = require('express');
const client = require('./config/dbconfig.js');
const cors=require('cors')     
const logger = require('./config/logger');
const { createTables } = require('./controllers/tableControllers');
const { createDatabase } = require('./config/dbconfig');
require('dotenv').config();

//const eventRoute = require('./routes/eventRoutes.js');

const app = express();
app.use(express.json());
app.use(cors());
//app.use('/event', eventRoute);

const initializeApp = async () => {
  try {
    await createDatabase();
    logger.info('Database created or already exists');

    await client.connect();
    logger.info('Connected to the Caterorange DB');

    await createTables();
    logger.info('Tables created successfully');

    app.use(express.json());

    app.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error('Initialization error:', err.message);
    process.exit(1);
  }
};

initializeApp();
//app.use('/', allRoutes);








// const express = require('express');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const port = 5000; 

// const cors = require('cors');
// app.use(cors());

// app.get('/api/data', (req, res) => {
//     const filePath = path.join(__dirname, 'priceList.json');
//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             res.status(500).json({ error: 'Error reading file' });
//             return;
//         }
//         res.json(JSON.parse(data));
//     });
// });

// app.listen(port, () => {
//     console.log(`Backend server is running at http://localhost:${port}`);
// });