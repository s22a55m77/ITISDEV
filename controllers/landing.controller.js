const e = require('express')
const httpContext = require('express-http-context')
const isAuthorized = require('../utils/isAuthorized.js')
const { announcementModel, userModel } = require('../models/index.js')

const landingController = e.Router()

landingController.get('/', isAuthorized, async (req, res) => {
  const email = httpContext.get('userEmail')

  const user = await userModel.findOne({ email })

  const unRead = await announcementModel.find({ read: { $ne: user._id } })

  res.render('landing/landing.ejs', { unRead: unRead.length })
})

module.exports = landingController
