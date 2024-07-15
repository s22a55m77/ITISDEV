const mongoose = require('./utils/mongoose.js')
const fs = require('fs')

const { imageModel } = require('./models/index.js')

async function main() {
  const image = fs.readFileSync('path\\to\\image')

  await imageModel.create({
    image: image,
    location: 'DLSU LAG DROP',
  })

  mongoose.disconnect()
}

main()
