const e = require('express')
const isAuthorized = require('../utils/isAuthorized')
const { userModel } = require('../models/index.js')
const httpContext = require('express-http-context')

const profileModuleController = e.Router()

profileModuleController.get('/', isAuthorized, async (req, res) => {
  const email = httpContext.get('userEmail')
  const { name, idNumber, picture, designation } = await userModel.findOne({
    email: email,
  })

  res.render('profileModule/profile.ejs', {
    name,
    idNumber,
    picture,
    designation,
  })
})

profileModuleController.get('/settings', isAuthorized, (req, res) => {
  res.render('profileModule/settings.ejs')
})

profileModuleController.get('/test', async (req, res) => {
  const user = await userModel.findOne({
    email: 'mathew_benavidez@dlsu.edu.ph',
  })
  res.send(user)
})

module.exports = profileModuleController
