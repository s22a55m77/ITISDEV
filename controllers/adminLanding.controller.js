const e = require('express')

const adminLandingController = e.Router()

adminLandingController.get('/', (req, res) => {
  res.render('adminLanding/landing.ejs')
})

module.exports = adminLandingController