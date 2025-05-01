const db = require('../database/pg.database');
const cloudinary = require('cloudinary').v2;

exports.createItem = async (item) => {
    try {
        const res = await db.query(`INSERT INTO items (name, price, store_id, stock) 
            VALUES ($1, $2, $3, $4) RETURNING *`, 
            [item.name, item.price, item.store_id, item.stock]
        );
        
        if (item.image) {
            const uploadResult = await cloudinary.uploader.upload(item.image, {
                public_id: res.rows[0].id,
                folder: 'items',
                resource_type: 'auto'
            });

            await db.query(`UPDATE items SET image_url = $1 WHERE id = $2`,
                [uploadResult.secure_url, res.rows[0].id]
            );
        }
        
        return res.rows[0];
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}

exports.getAllItems = async () => {
    try {
        const res = await db.query('SELECT * FROM items');
        return res.rows;
    } catch (error) {
        console.error('Get all items failed:', error);
        throw error;
    }
}

exports.getItemById = async (id) => {
    try {
        const res = await db.query('SELECT * FROM items WHERE id = $1', [id]);
        return res.rows[0];
    } catch (error) {
        console.error('Get item by id failed:', error);
        throw error;
    }
}

exports.getStoreItems = async (store_id) => {
    try {
        const res = await db.query('SELECT * FROM items WHERE store_id = $1', [store_id]);
        return res.rows;
    } catch (error) {
        console.error('Get store items failed:', error);
        throw error;
    }
}

exports.updateItem = async (item) => {
    try {
        let newImageUrl = item.image;

        if (item.image) {
            const result = await cloudinary.uploader.upload(item.image, {
                public_id: item.id,
                folder: 'items',
                resource_type: 'auto',
                overwrite: true,
                invalidate: true
            });
            newImageUrl = result.secure_url
        }

        const res = await db.query(
            `UPDATE items 
            SET name = $1, price = $2, stock = $3, image_url = $4
            WHERE id = $5 RETURNING *`, 
            [item.name, item.price, item.stock, newImageUrl, item.id]
        );

        return res.rows[0];

    } catch (error) {
        console.error('Update item failed:', error);
        throw error;
    }
};

exports.deleteItem = async (id) => {
    try {
        const cloudCheck = await db.query('SELECT image_url FROM items WHERE id = $1', [id]);
        if (cloudCheck.rows.length > 0 && cloudCheck.rows[0].image_url) {
            const public_id = 'items/' + id;
            await cloudinary.uploader.destroy(public_id);
        }
        const res = await db.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
        return res.rows[0];
    } catch (error) {
        console.error('Delete item failed:', error);
        throw error;
    }
}
