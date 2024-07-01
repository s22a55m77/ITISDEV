const e = require('express')
const { scheduleModel, scheduleDetailModel } = require('../models/index.js')
const moment = require('moment-timezone')
const mongoose = require('../utils/mongoose.js')
const {
  getWeekdays,
  getSaturdays,
  mergeDateAndTime,
} = require('../utils/dateUtil.js')

const adminScheduleModuleController = e.Router()

adminScheduleModuleController.get('/', async (req, res) => {
  const schedules = await scheduleModel.find()

  res.render('adminScheduleModule/schedule.ejs', { schedules })
})

adminScheduleModuleController.get('/create', (req, res) => {
  res.render('adminScheduleModule/create.ejs')
})

adminScheduleModuleController.post('/create', async (req, res) => {
  const { line, from, to, label, schedules } = req.body

  const fromStr = moment(from).tz('Asia/Manila').format('MMM D')
  const toStr = moment(to).tz('Asia/Manila').format('MMM D')
  const dateRange = `${fromStr} - ${toStr}`
  const schedule = new scheduleModel({
    line,
    dateRange,
    label,
    detailsJson: JSON.stringify({ schedules }),
  })

  const weekdays = getWeekdays(from, to)
  const saturdays = getSaturdays(from, to)

  const toDesWeekdays = mergeDateAndTime(weekdays, schedules[0].weekdays)
  const toDesSaturdays = mergeDateAndTime(saturdays, schedules[0].saturdays)
  const toDesDates = toDesWeekdays.concat(toDesSaturdays)

  const returnWeekdays = mergeDateAndTime(weekdays, schedules[1].weekdays)
  const returnSaturdays = mergeDateAndTime(saturdays, schedules[1].saturdays)
  const returnDates = returnWeekdays.concat(returnSaturdays)

  const toDesDetails = toDesDates.map((time) => {
    return {
      from: schedules[0].from,
      to: schedules[0].to,
      time,
    }
  })

  const returnDetails = returnDates.map((time) => {
    return {
      from: schedules[1].from,
      to: schedules[1].to,
      time,
    }
  })

  try {
    const scheduleDoc = await schedule.save()

    const scheduleDetails = await scheduleDetailModel.insertMany(
      toDesDetails.concat(returnDetails)
    )
    await scheduleModel.findByIdAndUpdate(scheduleDoc._id, {
      $push: { details: scheduleDetails },
    })
    res.send({ success: true })
  } catch (err) {
    console.error(err)
    res.send({ success: false, error: err })
  }
})

adminScheduleModuleController.get('/edit/:id', async (req, res) => {
  const id = req.params.id

  const schedule = await scheduleModel.findById(id).populate('details')

  const from = moment(schedule.dateRange.split(' - ')[0], 'MMM D').format(
    'YYYY-MM-DD'
  )
  const to = moment(schedule.dateRange.split(' - ')[1], 'MMM D').format(
    'YYYY-MM-DD'
  )

  res.render('adminScheduleModule/edit.ejs', {
    from,
    to,
    line: schedule.line,
    label: schedule.label,
    schedules: schedule.detailsJson,
  })
})

module.exports = adminScheduleModuleController
