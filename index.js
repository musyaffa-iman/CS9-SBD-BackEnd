const express = require('express');
require('dotenv').config();
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount routes with /api prefix
app.use('/api/store', require('./src/routes/store.route'));
app.use('/api/user', require('./src/routes/user.route'));
app.use('/api/item', require('./src/routes/item.route'));
app.use('/api/transaction', require('./src/routes/transaction.route'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

