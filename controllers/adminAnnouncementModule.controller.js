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

adminAnnouncementModuleController.get('/edit/:id', isSSU, async (req, res) => {
  const id = req.params.id

  const { title, description } = await announcementModel.findById(id)

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
