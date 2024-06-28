const { Schema, model } = require('mongoose')

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    designation: { type: String },
    idNumber: { type: Number },
    college: { type: String },
    department: { type: String },
    campus: { type: String },
    eaf: { type: Buffer },
    vaccinationCard: { type: Buffer },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'client', 'dispatcher'],
      default: 'client',
    },
  },
  { collection: 'User', timestamps: true }
)

const userModel = model('User', userSchema)

module.exports = userModel
