const e = require('express')

const adminCheckInController = e.Router()

adminCheckInController.get('/', (req, res) => {
  res.render('adminCheckInModule/checkIn.ejs')
})

adminCheckInController.get('/scan', (req, res) => {
  res.render('adminCheckInModule/scan.ejs')
})

adminCheckInController.get('/result', (req, res) => {
  res.render('adminCheckInModule/result.ejs')
})

module.exports = adminCheckInController