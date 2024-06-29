const e = require('express')
const isAuthorized = require('../utils/isAuthorized.js')

const landingController = e.Router()

landingController.get('/', isAuthorized, (req, res) => {
  res.render('landing/landing.ejs')
})

module.exports = landingController
