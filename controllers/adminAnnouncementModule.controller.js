const e = require('express')
const isSSU = require('../utils/isSSU.js')
const { announcementModel } = require('../models/index.js')

const adminAnnouncementModuleController = e.Router()

adminAnnouncementModuleController.get('/', isSSU, async (req, res) => {
  const announcements = await announcementModel.find()

  res.render('adminAnnouncementModule/adminAnnouncementList.ejs', {
    announcements,
  })
})

adminAnnouncementModuleController.get('/detail/:id', (req, res) => {
  const id = req.params.id

  res.render('adminAnnouncementModule/adminAnnouncementDetail.ejs')
})

adminAnnouncementModuleController.get('/create', (req, res) => {
  res.render('adminAnnouncementModule/adminCreateAnnouncement.ejs')
})

adminAnnouncementModuleController.post('/create', async (req, res) => {
  const { title, description } = req.body

  try {
    const announcement = new announcementModel({
      title,
      description,
    })

    await announcement.save()

    res.redirect('/admin/announcement?success=created')
    return
  } catch (error) {
    console.error(error)
    res.redirect('/admin/announcement/create?error=create-failed')
    return
  }
})

adminAnnouncementModuleController.get('/edit/:id', (req, res) => {
  const id = req.params.id

  res.render('adminAnnouncementModule/adminEditAnnouncement.ejs')
})

module.exports = adminAnnouncementModuleController
