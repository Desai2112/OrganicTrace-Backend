import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  // blockchainId: {
  //   type: Number,
  //   required: true,
  //   unique: true,
  // },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  certificationType: {
    type: String,
    required: true,
    enum: ['organic_production', 'organic_processing', 'organic_handling'],
    default: 'organic_production',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'expired'],
    default: 'pending',
  },
  productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    // required: true,
  },
});

export default mongoose.model('Certificate', certificateSchema);
