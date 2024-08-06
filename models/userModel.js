const { Schema, model } = require('../utils/mongoose.js')

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    designation: { type: String },
    idNumber: { type: Number },
    collegeOrDepartment: { type: String },
    campus: { type: String },
    campusUpdatedAt: { type: Date},
    eaf: { type: Buffer },
    eafUpdatedAt: { type: Date },
    vaccinationRecord: { type: Buffer },
    vaccinationRecordUpdatedAt: { type: Date },
    picture: { type: String },
    role: {
      type: String,
      required: true,
      enum: ['ssu', 'passenger', 'dispatcher', 'admin'],
      default: 'passenger',
    },
  },
  { collection: 'User', timestamps: true }
)

const userModel = model('User', userSchema)

module.exports = userModel
