const e = require('express')

const registrationModuleController = e.Router()

registrationModuleController.get('/signin', (req, res) => {
  res.render('registrationModule/signin.ejs')
})

registrationModuleController.get('/confirm', (req, res) => {
  res.render('registrationModule/confirm.ejs')
})

registrationModuleController.get('/success', (req, res) => {
  const type = req.query.type

  res.render('registrationModule/success.ejs', { type })
})

registrationModuleController.get('/confirm/create', (req, res) => {
  res.render('registrationModule/confirmCreateAcc.ejs')
})

registrationModuleController.get('/create', (req, res) => {
  res.render('registrationModule/create.ejs')
})

module.exports = registrationModuleController
