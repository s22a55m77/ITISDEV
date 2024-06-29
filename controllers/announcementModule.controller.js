const e = require('express')

const announcementModuleController = e.Router()

announcementModuleController.get('/', (req, res) => {
  res.render('clientAnnouncementModule/announcement.ejs')
})

announcementModuleController.get('/detail/:id', (req, res) => {
  res.render('clientAnnouncementModule/announcementDetail.ejs')
})

module.exports = announcementModuleController
