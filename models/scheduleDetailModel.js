const { Schema, model } = require('../utils/mongoose.js')

const scheduleDetailSchema = new Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    time: { type: Date, required: true },
    slot: { type: Number, default: 30 },
    reserve: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          enum: ['reserved', 'pending', 'absent'],
          default: 'pending',
        },
      },
    ],
    approval: [{ type: Schema.Types.ObjectId, ref: 'ReservationApproval' }],
  },
  { collection: 'ScheduleDetail', timestamps: true }
)

scheduleDetailSchema.pre('remove', async (next) => {
  try {
    // Get the ReservationApproval model
    const reservationApproval = this.model('ReservationApproval')

    // Delete all associated approval documents
    await reservationApproval.deleteMany({ _id: { $in: this.approval } })

    next()
  } catch (error) {
    next(error)
  }
})

const scheduleDetailModel = model('ScheduleDetail', scheduleDetailSchema)

module.exports = scheduleDetailModel
