const e = require('express')
const isSSU = require('../utils/isSSU.js')
const emailTransporter = require('../utils/email.js')
const { announcementModel, userModel } = require('../models/index.js')
require('dotenv').config()

const adminAnnouncementModuleController = e.Router()

adminAnnouncementModuleController.get('/', isSSU, async (req, res) => {
  const announcements = await announcementModel.find()

  res.render('adminAnnouncementModule/adminAnnouncementList.ejs', {
    announcements,
  })
})

adminAnnouncementModuleController.get(
  '/detail/:id',
  isSSU,
  async (req, res) => {
    const id = req.params.id

    const announcement = await announcementModel.findById(id).catch((error) => {
      return res.redirect('/404.html')
    })

    if (!announcement) return res.redirect('/404.html')

    const { description, title, createdAt } = announcement

    res.render('adminAnnouncementModule/adminAnnouncementDetail.ejs', {
      title,
      description,
      createdAt,
    })
  }
)

adminAnnouncementModuleController.get('/create', isSSU, (req, res) => {
  res.render('adminAnnouncementModule/adminCreateAnnouncement.ejs')
})

adminAnnouncementModuleController.post('/create', isSSU, async (req, res) => {
  const { title, description } = req.body

  try {
    const announcement = new announcementModel({
      title,
      description,
    })

    const doc = await announcement.save()

    try {
      const users = await userModel.find({ role: 'passenger' })
      const emails = users.map((user) => user.email)

      const url = process.env.WEBSITE_URL + '/announcement/' + doc._id

      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        sender: 'Announcement Notification',
        to: emails,
        subject: `New Announcement: ${title}`,
        html: `<center><h1>${title}</h1><div>${description}</div><div>Visit <a href="${url}">website</a> for more details</div></center>`,
      })
    } catch (error) {
      console.error('Error in sending mail' + error)
    }

    res.redirect('/admin/announcement?success=created')
    return
  } catch (error) {
    console.error(error)
    res.redirect('/admin/announcement/create?error=create-failed')
    return
  }
})

adminAnnouncementModuleController.get('/edit/:id', isSSU, async (req, res) => {
  const id = req.params.id

  const announcement = await announcementModel.findById(id).catch((error) => {
    return res.redirect('/404.html')
  })

  if (!announcement) return res.redirect('/404.html')

  const { title, description } = announcement

  res.render('adminAnnouncementModule/adminEditAnnouncement.ejs', {
    id,
    title,
    description,
  })
})

adminAnnouncementModuleController.post('/edit/:id', isSSU, async (req, res) => {
  const id = req.params.id
  const { title, description } = req.body

  try {
    await announcementModel.findByIdAndUpdate(id, {
      title,
      description,
    })

    res.redirect('/admin/announcement?success=edited')
    return
  } catch (error) {
    console.error(error)
    res.redirect('/admin/announcement/edit/' + id + '?error=edit-failed')
    return
  }
})

adminAnnouncementModuleController.get(
  '/delete/:id',
  isSSU,
  async (req, res) => {
    const id = req.params.id

    try {
      await announcementModel.findByIdAndDelete(id)
      res.redirect('/admin/announcement?success=deleted')
      return
    } catch (error) {
      console.error(error)
      res.redirect('/admin/announcement?error=delete-failed')
      return
    }
  }
)

module.exports = adminAnnouncementModuleController
