const { Schema, model } = require('../utils/mongoose.js')

const imageSchema = new Schema(
  {
    image: { type: Buffer, required: true },
    location: { type: String, required: true },
  },
  { collection: 'Image', timestamps: true }
)

const imageModel = model('Image', imageSchema)

module.exports = imageModel
