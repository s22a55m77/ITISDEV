const { Schema, model } = require('../utils/mongoose.js')

const notificationSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    to: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    read: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { collection: 'Notification', timestamps: true }
)

const notificationModel = model('Notification', notificationSchema)

module.exports = notificationModel
