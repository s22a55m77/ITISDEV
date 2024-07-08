const e = require('express')
const httpContext = require('express-http-context')
const isAuthorized = require('../utils/isAuthorized.js')
const { announcementModel, userModel } = require('../models/index.js')

const landingController = e.Router()

landingController.get('/', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')

  const unRead = await announcementModel.find({ read: { $ne: user._id } })

  res.render('landing/landing.ejs', { unRead: unRead.length, name:user.name })
})

module.exports = landingController
