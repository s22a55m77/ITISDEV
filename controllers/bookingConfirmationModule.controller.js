const e = require('express')

const bookingConfirmationModule = e.Router()

bookingConfirmationModule.get('/', (req, res) => {
  res.render('bookingConfirmationModule/bookingList/bookingList.ejs')
})

bookingConfirmationModule.get('/scanner', (req, res) => {
  res.render('bookingConfirmationModule/bookingScanner/bookingScanner.ejs')
})

module.exports = bookingConfirmationModule
