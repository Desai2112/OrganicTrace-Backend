import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'in_production', 'certified', 'in_transit', 'delivered'],
    default: 'registered'
  },
  trackingHistory: [{
    timestamp: Date,
    location: String,
    status: String,
    handler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transactionHash: String,
    metadata: Object
  }],
  specifications: {
    quantity: Number,
    unit: String,
    harvestDate: Date,
    batchNumber: String,
    additionalDetails: Object
  },
  documents: [{
    type: String,
    fileUrl: String,
    ipfsHash: String,
    uploadDate: Date
  }]
}, { timestamps: true });

export default mongoose.model('Product', productSchema); 