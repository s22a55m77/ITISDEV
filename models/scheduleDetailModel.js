const { Schema, model } = require('../utils/mongoose.js')

const scheduleDetailSchema = new Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    time: { type: Date, required: true },
    slot: { type: Number, default: 30 },
    reserve: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { collection: 'ScheduleDetail', timestamps: true }
)

const scheduleDetailModel = model('ScheduleDetail', scheduleDetailSchema)

module.exports = scheduleDetailModel
