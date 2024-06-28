const e = require('express')
const { getAuth } = require('firebase-admin/auth')
const { userModel } = require('../models/index.js')

const registrationModuleController = e.Router()

registrationModuleController.get('/signin', (req, res) => {
  res.render('registrationModule/signin.ejs')
})

registrationModuleController.post('/signin', async (req, res) => {
  const { idToken } = req.body

  const decodedToken = await getAuth().verifyIdToken(idToken)

  if (!decodedToken.email.endsWith('@dlsu.edu.ph')) {
    await getAuth().deleteUser(uid)
    res.redirect('/auth/error?error=invalid-email-domain')
  }

  const user = await userModel.findOne({ email: decodedToken.email })

  if (!user) {
    res.redirect('/auth/confirm/create')
  }
  res.redirect('/auth/confirm')
})

registrationModuleController.get('/confirm', (req, res) => {
  res.render('registrationModule/confirm.ejs')
})

registrationModuleController.get('/success', async (req, res) => {
  const type = req.query.type

  const sessionCookie = await getAuth().createSessionCookie(req.body.idToken, {
    expiresIn: 60 * 60 * 24 * 30,
  })

  res.cookie('session', sessionCookie, {
    maxAge: 60 * 60 * 24 * 30 * 1000,
  })

  res.render('registrationModule/success.ejs', { type })
})

registrationModuleController.get('/confirm/create', (req, res) => {
  res.render('registrationModule/confirmCreateAcc.ejs')
})

registrationModuleController.get('/create', (req, res) => {
  res.render('registrationModule/create.ejs')
})

module.exports = registrationModuleController
