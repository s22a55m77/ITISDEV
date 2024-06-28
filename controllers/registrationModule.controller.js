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
    res.send({
      success: false,
      message: 'Invalid email domain',
    })
    return
  }

  const user = await userModel.findOne({ email: decodedToken.email })

  if (!user) {
    res.send({
      success: true,
      nextUrl: '/auth/confirm/create',
    })

    return
  }

  res.send({
    success: true,
    nextUrl: '/auth/confirm',
  })
})

registrationModuleController.get('/confirm', (req, res) => {
  res.render('registrationModule/confirmAcc.ejs')
})

registrationModuleController.get('/success', async (req, res) => {
  const { type, idToken } = req.query

  const sessionCookie = await getAuth()
    .createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 14 * 1000 - 1000,
    })
    .catch((error) => {
      console.error(error)
      res.redirect('/auth/signin')
      return
    })

  res.cookie('session', sessionCookie, {
    maxAge: 60 * 60 * 24 * 14 * 1000 - 1000,
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
