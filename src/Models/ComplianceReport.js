import mongoose from 'mongoose';

const complianceReportSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: true
  },
  reportType: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual', 'incident'],
    required: true
  },
  period: {
    start: Date,
    end: Date
  },
  complianceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  metrics: {
    totalChecks: Number,
    passedChecks: Number,
    criticalFindings: Number,
    improvementAreas: Number
  },
  findings: [{
    category: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved']
    },
    actionRequired: String,
    deadline: Date
  }],
  documents: [{
    type: String,
    fileUrl: String,
    ipfsHash: String,
    uploadDate: Date
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved', 'rejected'],
    default: 'draft'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String
}, { timestamps: true });

export default mongoose.model('ComplianceReport', complianceReportSchema); 