const e = require('express')

const notificationModuleController = e.Router()

notificationModuleController.get('/', (req, res) => {
  res.render('notificationModule/notification.ejs')
})

notificationModuleController.get('/detail', (req, res) => {
  res.render('notificationModule/notificationDetail.ejs')
})

module.exports = notificationModuleController
