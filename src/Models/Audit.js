import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true,
    unique: true
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: true
  },
  auditor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  auditType: {
    type: String,
    enum: ['initial', 'surveillance', 'renewal', 'special'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'failed'],
    default: 'scheduled'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completionDate: Date,
  findings: [{
    category: {
      type: String,
      enum: ['observation', 'minor_non_conformity', 'major_non_conformity', 'critical_non_conformity']
    },
    description: String,
    evidence: [String],
    correctionRequired: Boolean,
    correctionDeadline: Date,
    status: {
      type: String,
      enum: ['open', 'closed', 'in_progress']
    }
  }],
  documents: [{
    type: String,
    fileUrl: String,
    ipfsHash: String,
    uploadDate: Date
  }],
  transactionHash: String,
  metadata: {
    location: String,
    auditScope: [String],
    auditorNotes: String
  }
}, { timestamps: true });

export default mongoose.model('Audit', auditSchema); 