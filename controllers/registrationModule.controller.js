const e = require('express')
const moment = require('moment-timezone')
const { getAuth } = require('firebase-admin/auth')
const { userModel } = require('../models/index.js')

const registrationModuleController = e.Router()

registrationModuleController.get('/signin', (req, res) => {
  res.render('registrationModule/signIn.ejs')
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

registrationModuleController.get('/confirm', async (req, res) => {
  const { idToken } = req.query

  if (!idToken) {
    res.redirect('/auth/signin')
    return
  }

  try {
    const { email, name, picture } = await getAuth().verifyIdToken(idToken)
    res.render('registrationModule/confirmAcc.ejs', {
      email,
      name,
      picture,
    })
    return
  } catch (error) {
    console.error(error)
    res.redirect('/auth/signin?error=invalid-token')
    return
  }
})

registrationModuleController.get('/success', async (req, res) => {
  const { type, idToken } = req.query

  // check if user really create their account
  const decodedToken = await getAuth().verifyIdToken(idToken)
  const user = await userModel.findOne({ email: decodedToken.email })

  if (!user) {
    // this only happens if the user tries to access the success page without creating an account
    // let user know that they need to create an account
    res.redirect('/auth/signin?error=invalid-process')
    return
  }

  let sessionCookie

  try {
    sessionCookie = await getAuth().createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 14 * 1000 - 1000,
    })
  } catch (error) {
    console.error(error)
    res.redirect('/auth/signin?error=invalid-token')
    return
  }

  res.cookie('session', sessionCookie, {
    maxAge: 60 * 60 * 24 * 14 * 1000 - 1000,
  })

  res.render('registrationModule/success.ejs', { type })
})

registrationModuleController.get('/confirm/create', async (req, res) => {
  const { idToken } = req.query

  if (!idToken) {
    res.redirect('/auth/signin')
    return
  }

  try {
    const { email, name, picture } = await getAuth().verifyIdToken(idToken)
    res.render('registrationModule/confirmCreateAcc.ejs', {
      email,
      name,
      picture,
    })
    return
  } catch (error) {
    console.error(error)
    res.redirect('/auth/signin?error=invalid-token')
  }

  res.redirect('/auth/signin?error=unknown-error')
})

registrationModuleController.get('/create', (req, res) => {
  res.render('registrationModule/createAcc.ejs')
})

registrationModuleController.post('/create', async (req, res) => {
  console.log(req.body)
  console.log(req.files.eaf.data)

  try {
    const { email, name, picture } = await getAuth().verifyIdToken(
      req.body.idToken
    )

    const user = new userModel({
      email,
      name,
      designation: req.body.designation,
      idNumber: req.body.idNumber,
      collegeOrDepartment: req.body.collegeOrDepartment,
      campus: req.body.campus,
      eaf: req.files.eaf.data,
      eafUpdatedAt: moment().tz('Asia/Manila').format(),
      vaccinationRecord: req.files.vaccinationRecord.data,
      vaccinationRecordUpdatedAt: moment().tz('Asia/Manila').format(),
      picture: picture,
    })

    await user.save()

    res.redirect('/auth/success?type=create&idToken=' + req.body.idToken)
    return
  } catch (error) {
    console.error(error)
    res.redirect(
      '/auth/create?idToken=' + req.body.idToken + '&error=create-account-error'
    )
    return
  }
})

module.exports = registrationModuleController
