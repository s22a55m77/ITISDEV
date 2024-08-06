const e = require('express')
const isAuthorized = require('../utils/isAuthorized')
const httpContext = require('express-http-context')

const adminLandingController = e.Router()

adminLandingController.get('/', isAuthorized, (req, res) => {
  const user = httpContext.get('user')

  if (
    user.role !== 'admin' &&
    user.role !== 'ssu' &&
    user.role !== 'dispatcher'
  ) {
    res.redirect('/403.html')
  }

  res.render('adminLanding/landing.ejs', { name: user.name, role: user.role })
})

module.exports = adminLandingController
