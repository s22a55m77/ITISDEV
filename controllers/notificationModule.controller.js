const e = require('express')

const notificationModuleController = e.Router()

notificationModuleController.get('/', (req, res) => {
  res.render('notificationModule/notificationList.ejs')
})

module.exports = notificationModuleController
