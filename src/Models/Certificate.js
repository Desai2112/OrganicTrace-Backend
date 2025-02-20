import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true,
    unique: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificationType: {
    type: String,
    required: true,
    enum: ['organic_production', 'organic_processing', 'organic_handling']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'expired', 'revoked'],
    default: 'pending'
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  products: [{
    name: String,
    category: String,
    specifications: Object
  }],
  documents: [{
    type: {
      type: String,
      enum: ['application', 'inspection_report', 'lab_results', 'compliance_checklist']
    },
    fileUrl: String,
    ipfsHash: String,
    uploadDate: Date
  }],
  certifier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  transactionHash: String,
  metadata: {
    standards: [String],
    scope: String,
    restrictions: [String]
  }
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema); 