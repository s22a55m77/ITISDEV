const { Schema, model } = require('../utils/mongoose.js')

const reservationApprovalSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    designation: { type: String, required: true },
    purpose: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    time: { type: Date, required: true },
  },
  { collection: 'ReservationApproval', timestamps: true }
)

const reservationApprovalModel = model(
  'ReservationApproval',
  reservationApprovalSchema
)

module.exports = reservationApprovalModel
