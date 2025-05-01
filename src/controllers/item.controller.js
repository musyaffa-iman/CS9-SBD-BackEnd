const itemRepository = require('../repositories/item.repository');
const storeRepository = require('../repositories/store.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.createItem = async (req, res) => {
    const { name, price, store_id, stock } = req.body;
    if (!name || !price || !store_id) {
        return baseResponse(res, false, 400, 'Name, price, and store are required', null);
    }
    try {
        const store = await storeRepository.getStoreById(store_id);
        if (!store) {
            baseResponse(res, false, 404, 'Store not found', null);
        }

        const image = req.file;
        let imageBase64 = null;
        if (image) {
            imageBase64 = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
        }
        
        const item = await itemRepository.createItem({ 
            name: name, 
            price: price, 
            store_id: store_id, 
            image: imageBase64,
            stock: stock
        });

        baseResponse(res, true, 201, 'Item created successfully', item);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.getAllItems = async (req, res) => {
    try {
        const items = await itemRepository.getAllItems();
        baseResponse(res, true, 200, 'Items retrieved successfully', items);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.getItemById = async (req, res) => {
    try {
        const item = await itemRepository.getItemById(req.params.id);
        if (!item) {
            baseResponse(res, false, 404, 'Item not found', null);
        }
        baseResponse(res, true, 200, 'Item retrieved successfully', item);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.getStoreItems = async (req, res) => {
    const store = await storeRepository.getStoreById(req.params.store_id);
    if (!store) {
        return baseResponse(res, false, 404, 'Store not found', null);
    }
    try {
        const items = await itemRepository.getStoreItems(req.params.store_id);
        baseResponse(res, true, 200, 'Items retrieved successfully', items);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.updateItem = async (req, res) => {
    const { id, name, price, store_id, stock } = req.body;
    const image = req.file;
    if (!name || !price || !store_id) {
        return baseResponse(res, false, 400, 'Name, price, and store are required', null);
    }
    try {
        const store = await storeRepository.getStoreById(store_id);
        if (!store) {
            return baseResponse(res, false, 404, 'Store not found', null);
        }

        const oldItem = await itemRepository.getItemById(id);
        if (!oldItem) {
            return baseResponse(res, false, 404, 'Item not found', null);
        }

        let imageBase64 = null;
        if (image) {
            imageBase64 = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
        }

        const updatedItem = await itemRepository.updateItem({
            id: id,
            name: name,
            price: price,
            stock: stock,
            image: imageBase64 || oldItem.image_url
        });

        baseResponse(res, true, 200, 'Item updated successfully', updatedItem);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.deleteItem = async (req, res) => {
    try {
        const item = await itemRepository.deleteItem(req.params.id);
        if (!item) {
            baseResponse(res, false, 404, 'Item not found', null);
        }
        baseResponse(res, true, 200, 'Item deleted successfully', item);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}