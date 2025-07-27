const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  soapData: {
    subjective: String,
    objective: String,
    assessment: String,
    plan: String
  },
  encryptedData: String,
  iv: String,
  allergies: [String],
  createdAt: { type: Date, default: Date.now },
  lastUpdated: Date,
  syncStatus: { type: String, enum: ['synced', 'pending'], default: 'synced' }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);