const { Schema, model } = require('../utils/mongoose.js')

const scheduleSchema = new Schema(
  {
    line: { type: Number, required: true },
    dateRange: { type: String, required: true },
    label: { type: String, required: true },
    detailsJson: { type: String, required: true },
    details: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ScheduleDetail',
      },
    ],
  },
  { collection: 'Schedule', timestamps: true }
)

const scheduleModel = model('Schedule', scheduleSchema)

module.exports = scheduleModel
