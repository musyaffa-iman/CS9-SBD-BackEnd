const bcrypt = require("bcrypt");
const saltRounds = 10;
const db = require('../database/pg.database');

exports.register = async (user) => {
    try {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashedPassword;

        const res = await db.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *', [user.email, user.password, user.name]);
        return res.rows[0];
    } catch (error) {
        console.log('Query failed', error);
    }
}

exports.login = async (email, password) => {
    try {
        const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!res.rows[0]) {
            return null;
        }

        const user = res.rows[0];
        console.log(password, user.password);
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return null;
        }
        return user;
    } catch (error) {
        console.log('Query failed', error);
    }
}

exports.getUserByEmail = async (email) => {
    try {
        const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0];
    } catch (error) {
        console.log('Query failed', error);
    }
}

exports.getUserById = async (id) => {
    try {
        const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0];
    } catch (error) {
        console.log('Query failed', error);
    }
}

exports.updateUser = async (user) => {
    try {
        const findUser = await db.query('SELECT * FROM users WHERE id = $1', [user.id]);
        if (!findUser.rows[0]) {
            return null;
        }
        
        const currentUser = findUser.rows[0];
        let updatedPassword = currentUser.password; 
        if (user.password) {
            updatedPassword = await bcrypt.hash(user.password, saltRounds);
        }

        const res = await db.query('UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *', [user.name, user.email, updatedPassword, user.id]);
        if (!res) {
            return null;
        }
        return res.rows[0];
    } catch (error) {
        console.log('Query failed', error);
    }
}

exports.deleteUser = async (id) => {
    try {
        const res = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        return res.rows[0];
    } catch (error) {
        console.log('Query failed', error);
    }
}

exports.topUp = async (id, amount) => {
    try {
        const res = await db.query('UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING *', [amount, id]);
        return res.rows[0];
    } catch (error) {
        console.log('Query failed', error);
    }
}