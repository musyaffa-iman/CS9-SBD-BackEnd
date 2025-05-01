require('dotenv').config();
const { Pool } = require('pg');

const { PG_CONNECTION_STRING, NODE_ENV } = process.env;

const poolConfig = {
    connectionString: PG_CONNECTION_STRING,
    ...(NODE_ENV === 'production' ? {
        ssl: {
            rejectUnauthorized: false
        }
    } : {})
};

const pool = new Pool(poolConfig);

const connect = async () => {
    try {
        await pool.connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Database connection failed', error);
    }
}

const query = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (error) {
        console.log('Query failed', error);
    }
}

const transaction = async (callback) => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Transaction Error:", err);
        throw err;
    } finally {
        if (client) client.release();
    }
};

module.exports = {
    query,
    pool,
    transaction
}

connect();