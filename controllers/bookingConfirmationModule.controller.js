const e = require('express')

const bookingConfirmationModule = e.Router()

bookingConfirmationModule.get('/', (req, res) => {
  res.render('bookingConfirmationModule/bookingList/bookingList.ejs')
})

bookingConfirmationModule.get('/scanner', (req, res) => {
  res.render('bookingConfirmationModule/bookingScanner/bookingScanner.ejs')
})

bookingConfirmationModule.get('/check', (req, res) => {
  const studentId = req.query.studentId
  const lineNumber = req.query.lineNumber

  res.send({
    studentId,
    lineNumber,
  })
})

module.exports = bookingConfirmationModule
