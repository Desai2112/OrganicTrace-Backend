import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    required: true,
    default: 'initial'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed'],
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
      enum: ['observation', 'minor_non_conformity', 'major_non_conformity']
    },
    description: String
  }],
}, { timestamps: true });

export default mongoose.model('Audit', auditSchema);
