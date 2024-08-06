const e = require('express')
const moment = require('moment-timezone')
const isAuthorized = require('../utils/isAuthorized')
const { userModel } = require('../models/index.js')
const httpContext = require('express-http-context')

const profileModuleController = e.Router()

profileModuleController.get('/', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')
  const { name, idNumber, picture, designation } = user

  res.render('profileModule/profile.ejs', {
    name,
    idNumber,
    picture,
    designation,
  })
})

profileModuleController.get('/settings', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')
  const { eafUpdatedAt, vaccinationRecordUpdatedAt, campus, campusUpdatedAt } = user

  res.render('profileModule/settings.ejs', {
    eafUpdatedAt,
    vaccinationRecordUpdatedAt,
    designation: campus,
    designationUpdatedAt: campusUpdatedAt,
  })
})

profileModuleController.post('/eaf', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')

  try {
    const eafData = req.files.eaf.data
    console.log(req.files.eaf.name)
    await userModel.updateOne(
      { email: user.email },
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
  const user = httpContext.get('user')

  try {
    const vaccination = req.files.vaccination.data
    await userModel.updateOne(
      { email: user.email },
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

profileModuleController.post('/designation', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')
  const { designation } = req.body

  try {
    await userModel.findByIdAndUpdate(user._id, { campus: designation, campusUpdatedAt: moment().tz('Asia/Manila').format()})
    return res.redirect('/profile/settings?success=designation-updated')
  } catch (error) {
    console.error(error)
    return res.redirect('/profile/settings?error=designation-update-error')
  }
  
})

profileModuleController.get('/test', async (req, res) => {
  const user = await userModel.findOne({
    email: 'mathew_benavidez@dlsu.edu.ph',
  })
  res.send(user)
})

module.exports = profileModuleController
