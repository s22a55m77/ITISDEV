const e = require('express')

const clientAnnouncementModuleController = e.Router()

clientAnnouncementModuleController.get('/', (req, res) => {
  res.render('clientAnnouncementModule/announcement.ejs')
})

clientAnnouncementModuleController.get('/detail/:id', (req, res) => {
  res.render('clientAnnouncementModule/announcementDetail.ejs')
})


module.exports = clientAnnouncementModuleController