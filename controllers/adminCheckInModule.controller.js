const e = require('express')

const adminCheckInController = e.Router()

adminCheckInController.get('/', (req, res) => {
  res.render('adminCheckInModule/checkIn.ejs')
})

module.exports = adminCheckInController