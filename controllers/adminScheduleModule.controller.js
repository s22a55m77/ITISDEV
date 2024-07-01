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
  const schedule = new scheduleModel({ line, dateRange, label })

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

  const map = new Map()

  schedule.details.forEach((detail) => {
    const key = `${detail.from}${detail.to}`
    map.set(key, map.get(key) ? map.get(key).concat(detail) : [detail])
  })

  const schedules = []

  for (const [key, value] of map) {
    const times = value.map((detail) => {
      return moment(detail.time).tz('Asia/Manila').format('HH:mm')
    })

    const weekdays = times.filter((time) => moment(time, 'HH:mm').day() !== 6)
    const saturdays = times.filter((time) => moment(time, 'HH:mm').day() === 6)

    schedules.push({
      from: value[0].from,
      to: value[0].to,
      weekdays: [...new Set(weekdays)],
      saturdays: [...new Set(saturdays)],
    })
  }

  res.send({ from, to, schedules })
})

adminScheduleModuleController.post('/edit/:id', async (req, res) => {
  const id = req.params.id
  const { deletedTime, addedTime, label, from, to } = req.body

  const schedule = await scheduleModel.findById(id).populate('details')

  const fromStr = moment(from).tz('Asia/Manila').format('MMM D')
  const toStr = moment(to).tz('Asia/Manila').format('MMM D')

  const dateRange = `${fromStr} - ${toStr}`
  schedule.dateRange = dateRange
  schedule.label = label
  schedule.save()

  // if date range is changed
  if (dateRange !== schedule.dateRange) {
    // delete all details out of date range
    const detailsToDelete = schedule.details.filter((detail) => {
      const date = moment(detail.time).tz('Asia/Manila').format('YYYY-MM-DD')
      return !moment(date).isBetween(from, to, undefined, '[]')
    })

    await scheduleDetailModel.deleteMany({
      _id: { $in: detailsToDelete.map((detail) => detail._id) },
    })
  }

  // deletedTime = [{from, to, time, isWeekday}]
  // delete all time in deletedTime
  if (deletedTime) {
    const detailsToDelete = schedule.details.filter((detail) => {
      // time is in different format, deletedTime is in format 'HH:mm'
      // details time is in format 'YYYY-MM-DDTHH:mm:ssZ'

      return deletedTime.some(
        (time) =>
          time.from === detail.from &&
          time.to === detail.to &&
          time.time === moment(detail.time).tz('Asia/Manila').format('HH:mm') &&
          !!time.isWeekday === (moment(detail.time).day() !== 6)
      )
    })

    await scheduleDetailModel.deleteMany({
      _id: { $in: detailsToDelete.map((detail) => detail._id) },
    })
  }

  // addedTime = [{from, to, weekdays, saturdays}]
  // add all time in addedTime
  const weekdays = getWeekdays(from, to)
  const saturdays = getSaturdays(from, to)

  const newSchedules = []

  addedTime.forEach((schedule) => {
    const weekdaySchedules = mergeDateAndTime(weekdays, schedule.weekdays)
    const saturdaySchedules = mergeDateAndTime(saturdays, schedule.saturdays)

    const dates = weekdaySchedules.concat(saturdaySchedules)

    dates.forEach((time) => {
      newSchedules.push({
        from: schedule.from,
        to: schedule.to,
        time,
      })
    })
  })

  const scheduleDetails = await scheduleDetailModel.insertMany(newSchedules)

  await scheduleModel.findByIdAndUpdate(id, {
    $push: { details: scheduleDetails },
  })

  res.send({ success: true })
})

module.exports = adminScheduleModuleController
