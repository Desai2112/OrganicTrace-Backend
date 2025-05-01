import mongoose from 'mongoose';

const trackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['harvested', 'certified', 'in_transit', 'delivered'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    required: true
  },
  notes: {
    type: String
  }
});

const trackingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming manufacturers are stored in the User collection with a specific role
    default: null // Null until transferred to a manufacturer
  },
  currentStatus: {
    type: String,
    enum: ['harvested', 'certified', 'in_transit', 'delivered'],
    default: 'harvested'
  },
  currentLocation: {
    type: String,
    required: true
  },
  nextDestination: {
    type: String,
    default: null
  },
  expectedDeliveryDate: {
    type: Date
  },
  timeline: [trackingEventSchema]
}, {
  timestamps: true
});

export default mongoose.model('ProductTracking', trackingSchema);