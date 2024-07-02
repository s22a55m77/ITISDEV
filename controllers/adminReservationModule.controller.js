const e = require('express')

const adminReservationModuleController = e.Router()

adminReservationModuleController.get('/', (req, res) => {
  res.render('adminReservationModule/reservation.ejs')
})

module.exports = adminReservationModuleController