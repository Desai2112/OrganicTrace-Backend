import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['registered', 'certified', 'delivered'],
    default: 'registered',
  },
  ipfsHash: {
    type: String,
    required: true,
  },
  registeredBy: {
    type: String,
    required: true,
  },
  harvestDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  certifications: [{
    type: String,
  }],
});

export default mongoose.model('Product', productSchema);