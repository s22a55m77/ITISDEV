const { Schema, model } = require('../utils/mongoose.js')

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    designation: { type: String },
    idNumber: { type: Number },
    collegeOrDepartment: { type: String },
    campus: { type: String },
    eaf: { type: Buffer },
    vaccinationCard: { type: Buffer },
    picture: { type: Buffer },
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
