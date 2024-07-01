const e = require('express')

const adminScheduleModuleController = e.Router()

adminScheduleModuleController.get('/', (req, res) => {
  res.render('adminScheduleModule/schedule.ejs')
})

adminScheduleModuleController.get('/create', (req, res) => {
  res.render('adminScheduleModule/create.ejs')
})

adminScheduleModuleController.get('/edit/:id', (req, res) => {
  const id = req.params.id

  res.render('adminScheduleModule/edit.ejs')
})

module.exports = adminScheduleModuleController
