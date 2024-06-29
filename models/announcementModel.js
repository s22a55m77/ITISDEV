const { Schema, model } = require('../utils/mongoose.js')

const announcementSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { collection: 'Announcement', timestamps: true }
)

const announcementModel = model('Announcement', announcementSchema)

module.exports = announcementModel
