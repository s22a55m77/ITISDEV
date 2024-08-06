const { Schema, model } = require('../utils/mongoose.js')
const reservationApproval = require('./reservationApprovalModel.js')
const emailTransporter = require('../utils/email.js')
const moment = require('moment-timezone')
require('dotenv').config()

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
          enum: ['present', 'pending', 'absent'],
          default: 'pending',
        },
      },
    ],
    approval: [{ type: Schema.Types.ObjectId, ref: 'ReservationApproval' }],
  },
  { collection: 'ScheduleDetail', timestamps: true }
)

const scheduleDetailModel = model('ScheduleDetail', scheduleDetailSchema)

module.exports = scheduleDetailModel
