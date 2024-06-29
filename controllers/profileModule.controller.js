const e = require('express')
const moment = require('moment-timezone')
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

profileModuleController.get('/settings', isAuthorized, async (req, res) => {
  const email = httpContext.get('userEmail')
  const { eafUpdatedAt, vaccinationRecordUpdatedAt } = await userModel.findOne({
    email: email,
  })

  res.render('profileModule/settings.ejs', {
    eafUpdatedAt,
    vaccinationRecordUpdatedAt,
  })
})

profileModuleController.post('/eaf', isAuthorized, async (req, res) => {
  const email = httpContext.get('userEmail')

  try {
    const eafData = req.files.eaf.data
    console.log(req.files.eaf.name)
    await userModel.updateOne(
      { email: email },
      { eaf: eafData, eafUpdatedAt: moment().tz('Asia/Manila').format() }
    )
    res.redirect('/profile/settings?success=eaf-uploaded')
    return
  } catch (error) {
    console.error(error)
    res.redirect('/profile/settings?error=eaf-upload-error')
    return
  }
})

profileModuleController.post('/vaccination', isAuthorized, async (req, res) => {
  const email = httpContext.get('userEmail')

  try {
    const vaccination = req.files.vaccination.data
    await userModel.updateOne(
      { email: email },
      {
        vaccinationRecord: vaccination,
        vaccinationRecordUpdatedAt: moment().tz('Asia/Manila').format(),
      }
    )
    res.redirect('/profile/settings?success=vaccination-uploaded')
    return
  } catch (error) {
    console.error(error)
    res.redirect('/profile/settings?error=vaccination-upload-error')
    return
  }
})

profileModuleController.get('/test', async (req, res) => {
  const user = await userModel.findOne({
    email: 'mathew_benavidez@dlsu.edu.ph',
  })
  res.send(user)
})

module.exports = profileModuleController
