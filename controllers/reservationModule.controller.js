const e = require('express')

const reservationModuleController = e.Router()

reservationModuleController.get('/', (req, res) => {
  res.render('reservationModule/reserveTrip.ejs')
})

module.exports = reservationModuleController