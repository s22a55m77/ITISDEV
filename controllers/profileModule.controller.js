const e = require('express')

const profileModuleController = e.Router()

profileModuleController.get('/', (req, res) => {
  res.render('profileModule/profile.ejs')
})

profileModuleController.get('/settings', (req, res) => {
  res.render('profileModule/settings.ejs')
})

module.exports = profileModuleController
