const e = require('express')

const adminAnnouncementModuleController = e.Router()

adminAnnouncementModuleController.get('/', (req, res) => {
  res.render('adminAnnouncementModule/adminAnnouncementList.ejs')
})

adminAnnouncementModuleController.get('/detail/:id', (req, res) => {
  const id = req.params.id

  res.render('adminAnnouncementModule/adminAnnouncementDetail.ejs')
})

adminAnnouncementModuleController.get('/create', (req, res) => {
  res.render('adminAnnouncementModule/adminCreateAnnouncement.ejs')
})

adminAnnouncementModuleController.get('/edit/:id', (req, res) => {
  const id = req.params.id

  res.render('adminAnnouncementModule/adminEditAnnouncement.ejs')
})

module.exports = adminAnnouncementModuleController
