import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inventoryName: {
        type: String,
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            itemName: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 0
            },
            unitPrice: {
                type: Number,
                required: true,
                min: 0
            },
            totalPrice: {
                type: Number,
                required: true,
                default: function () {
                    return this.quantity * this.unitPrice;
                }
            }
        }
    ],

});

export default mongoose.model('Inventory', inventorySchema); 