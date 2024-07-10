const e = require('express')
const { getAuth } = require('firebase-admin/auth')
const { userModel } = require('../models/index.js')

const adminRegistrationModuleController = e.Router()

adminRegistrationModuleController.get('/signin', (req, res) => {
  res.render('adminRegistrationModule/signIn.ejs')
})

adminRegistrationModuleController.post('/signin', async (req, res) => {
  const { idToken } = req.body

  const decodedToken = await getAuth().verifyIdToken(idToken)

  const user = await userModel.findOne({ email: decodedToken.email })

  if (!user) {
    return res.send({
      success: false,
      nextUrl: '/admin/auth/signin?error=not-registered',
    })
  }

  let sessionCookie
  try {
    sessionCookie = await getAuth().createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 14 * 1000 - 1000,
    })
  } catch (error) {
    console.error(error)
    return res.redirect('/admin/auth/signin?error=invalid-token')
  }

  res.cookie('session', sessionCookie, {
    maxAge: 60 * 60 * 24 * 14 * 1000 - 1000,
  })

  res.send({ success: true, nextUrl: '/admin/' })
})

adminRegistrationModuleController.get('/create', async (req, res) => {
  res.render('adminRegistrationModule/create.ejs')
})

adminRegistrationModuleController.post('/create', async (req, res) => {
  const { email, role, name } = req.body

  await userModel.create({
    email,
    role,
    name,
  })

  res.redirect('/admin/auth/create?success=true')
})

module.exports = adminRegistrationModuleController
