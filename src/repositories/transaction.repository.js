const db = require('../database/pg.database');

exports.createTransaction = async (transactionData) => {
    return await db.transaction(async (client) => {
        const res = await client.query(
            `INSERT INTO transactions (user_id, item_id, quantity, total, status) 
             VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
            [transactionData.user_id, transactionData.item_id, transactionData.quantity, transactionData.total]
        );

        return res.rows[0];
    });
};

exports.payTransaction = async (transactionId) => {
    return await db.transaction(async (client) => {
        const trnRes = await client.query(
            'SELECT * FROM transactions WHERE id = $1 FOR UPDATE', 
            [transactionId]
        );
        if (trnRes.rows.length === 0) {
            throw new Error('Transaction not found');
        }
        const transaction = trnRes.rows[0];

        if (transaction.status === 'paid') {
            throw new Error('Transaction already paid');
        }

        const itemRes = await client.query(
            'SELECT stock FROM items WHERE id = $1 FOR UPDATE', 
            [transaction.item_id]
        );
        if (itemRes.rows.length === 0) {
            throw new Error('Item not found');
        }
        const item = itemRes.rows[0];

        if (item.stock < transaction.quantity) {
            throw new Error('Not enough stock available');
        }

        const userRes = await client.query(
            'SELECT balance FROM users WHERE id = $1 FOR UPDATE', 
            [transaction.user_id]
        );
        if (userRes.rows.length === 0) {
            throw new Error('User not found');
        }
        const user = userRes.rows[0];

        if (user.balance < transaction.total) {
            throw new Error('Insufficient balance');
        }

        await client.query(
            'UPDATE users SET balance = balance - $1 WHERE id = $2', 
            [transaction.total, transaction.user_id]
        );

        await client.query(
            'UPDATE items SET stock = stock - $1 WHERE id = $2', 
            [transaction.quantity, transaction.item_id]
        );

        const updatedTrnRes = await client.query(
            `UPDATE transactions 
            SET status = $1 
            WHERE id = $2 
            RETURNING *`, 
            ['paid', transactionId]
        );

        return updatedTrnRes.rows[0];
    });
};

exports.getAllTransactions = async () => {
    try {
        const res = await db.query('SELECT * FROM transactions');
        return res.rows;
    } catch (error) {
        console.log('Query failed', error);
    }
}

exports.deleteTransaction = async (transactionId) => {
    return await db.transaction(async (client) => {
        const trnRes = await client.query(
            'SELECT * FROM transactions WHERE id = $1 FOR UPDATE', 
            [transactionId]
        );
        if (trnRes.rows.length === 0) {
            return null;
        }
        const transaction = trnRes.rows[0];

        await client.query('DELETE FROM transactions WHERE id = $1', [transactionId]);

        return transaction;
    });
};
