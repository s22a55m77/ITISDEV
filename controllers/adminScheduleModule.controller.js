const e = require('express')
const {
  scheduleModel,
  scheduleDetailModel,
  notificationModel,
} = require('../models/index.js')
const moment = require('moment-timezone')
const mongoose = require('../utils/mongoose.js')
const {
  getWeekdays,
  getSaturdays,
  mergeDateAndTime,
  getDateChanges,
} = require('../utils/dateUtil.js')
const emailTransporter = require('../utils/email.js')
require('dotenv').config()

const adminScheduleModuleController = e.Router()

adminScheduleModuleController.get('/', async (req, res) => {
  const line = req.query.line

  if (!line) {
    return res.redirect('/admin/schedule?line=1')
  }
  const schedules = await scheduleModel.find({ line })

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
      return moment(detail.time).tz('Asia/Manila').format()
    })

    const weekdays = times
      .filter((time) => moment(time).day() !== 6)
      .map((time) => moment(time).format('HH:mm'))
    const saturdays = times
      .filter((time) => moment(time).day() === 6)
      .map((time) => moment(time).format('HH:mm'))

    schedules.push({
      from: value[0].from,
      to: value[0].to,
      weekdays: [...new Set(weekdays)],
      saturdays: [...new Set(saturdays)],
    })
  }

  res.render('adminScheduleModule/edit.ejs', {
    id: schedule._id,
    from,
    to,
    line: schedule.line,
    label: schedule.label,
    schedules: JSON.stringify(schedules),
  })
})

adminScheduleModuleController.post('/edit/:id', async (req, res) => {
  const id = req.params.id
  const { deletedTime, addedTime, label, from, to } = req.body

  const schedule = await scheduleModel.findById(id).populate('details')

  const fromStr = moment(from).tz('Asia/Manila').format('MMM D')
  const toStr = moment(to).tz('Asia/Manila').format('MMM D')

  const dateRange = `${fromStr} - ${toStr}`
  const originalDateRange = schedule.dateRange

  schedule.dateRange = dateRange
  schedule.label = label

  schedule.save()

  try {
    // if date range is changed
    if (dateRange !== originalDateRange) {
      // delete all details out of date range
      const oldStart = moment(
        originalDateRange.split(' - ')[0],
        'MMM D'
      ).format('YYYY-MM-DD')
      const oldEnd = moment(originalDateRange.split(' - ')[1], 'MMM D').format(
        'YYYY-MM-DD'
      )
      const newStart = from
      const newEnd = to

      const changes = getDateChanges(oldStart, oldEnd, newStart, newEnd)
      console.log(changes)
      changes.forEach(async (change) => {
        if (change.type === 'add') {
          const day = moment(change.date).tz('Asia/Manila').day()

          let details
          if (day === 6) {
            details = schedule.details.filter(
              (date) => moment(date.time).day() === 6
            )
          } else {
            details = schedule.details.filter(
              (date) => moment(date.time).day() < 6
            )
          }

          const lines = details.map((detail) => `${detail.from} - ${detail.to}`)
          const uniqueLines = [...new Set(lines)]

          const toTime = [
            ...new Set(
              details.map((detail) => {
                const line = `${detail.from} - ${detail.to}`
                if (line === uniqueLines[0]) {
                  return moment(detail.time).format('HH:mm')
                }
              })
            ),
          ]
          const returnTime = [
            ...new Set(
              details.map((detail) => {
                const line = `${detail.from} - ${detail.to}`
                if (line === uniqueLines[1]) {
                  return moment(detail.time).format('HH:mm')
                }
              })
            ),
          ]

          const newDetails = []
          toTime.forEach((time) => {
            if (time) {
              const formattedTime = moment(`${change.date} ${time}`)
                .tz('Asia/Manila')
                .format()
              newDetails.push({
                from: uniqueLines[0].split(' - ')[0],
                to: uniqueLines[0].split(' - ')[1],
                time: formattedTime,
              })
            }
          })

          returnTime.forEach((time) => {
            if (time) {
              const formattedTime = moment(`${change.date} ${time}`)
                .tz('Asia/Manila')
                .format()
              newDetails.push({
                from: uniqueLines[1].split(' - ')[0],
                to: uniqueLines[1].split(' - ')[1],
                time: formattedTime,
              })
            }
          })
          console.log(newDetails)
          const docs = await scheduleDetailModel.insertMany(newDetails)
          await scheduleModel.findByIdAndUpdate(id, {
            $push: { details: docs },
          })
        }
        if (change.type === 'delete') {
          const detailsToDelete = schedule.details.filter((detail) => {
            const date = moment(detail.time)
              .tz('Asia/Manila')
              .format('YYYY-MM-DD')

            return date === change.date
          })
          const ids = detailsToDelete.map((detail) => detail._id)
          await scheduleDetailModel.deleteMany({
            _id: { $in: ids },
          })

          const newDetails = schedule.details.filter(
            (detail) => !detailsToDelete.includes(detail)
          )

          await scheduleModel.findByIdAndUpdate(id, {
            details: newDetails,
          })
        }
      })
    }

    // deletedTime = [{from, to, time, isWeekday}]
    // delete all time in deletedTime
    if (deletedTime) {
      const detailsToDelete = schedule.details.filter((detail) => {
        // time is in different format, deletedTime is in format 'HH:mm'
        // details time is in format 'YYYY-MM-DDTHH:mm:ssZ'

        return deletedTime.some((time) => {
          return (
            time.from === detail.from &&
            time.to === detail.to &&
            time.time ===
              moment(detail.time).tz('Asia/Manila').format('HH:mm') &&
            (!!time.isWeekday === moment(detail.time).day() < 6 ||
              (time.isWeekday === 'false' && moment(detail.time).day() === 6))
          )
        })
      })

      const schedules = await scheduleDetailModel
        .find({
          _id: { $in: detailsToDelete.map((detail) => detail._id) },
        })
        .populate({
          path: 'reserve',
          populate: { path: 'user', strictPopulate: false },
        })

      schedules.forEach(async (schedule) => {
        if (schedule.reserve && schedule.reserve.length > 0) {
          const emails = schedule.reserve.map((user) => user.email)

          const from = schedule.from
          const to = schedule.to
          const time = moment(schedule.time)
            .tz('Asia/Manila')
            .format('MMM DD HH:mm')

          emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emails,
            subject: 'Reservation Cancelled',
            text: `Your reservation from ${from} to ${to} at ${time} has been cancelled.`,
          })

          const users = schedule.reserve.map((user) => user._id)

          await notificationModel.create({
            title: 'Reservation Cancelled',
            description: `Your reservation from ${from} to ${to} at ${time} has been cancelled.`,
            to: users,
          })
        }
      })

      await scheduleDetailModel.deleteMany({
        _id: { $in: detailsToDelete.map((detail) => detail._id) },
      })
    }

    // addedTime = [{from, to, weekdays, saturdays}]
    // add all time in addedTime
    if (addedTime) {
      const weekdays = getWeekdays(from, to)
      const saturdays = getSaturdays(from, to)

      const newSchedules = []

      addedTime.forEach((schedule) => {
        const weekdaySchedules = mergeDateAndTime(weekdays, schedule.weekdays)
        const saturdaySchedules = mergeDateAndTime(
          saturdays,
          schedule.saturdays
        )

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
    }
    res.send({ success: true })
  } catch (err) {
    console.error(err)
    res.send({ success: false, error: err })
  }
})

adminScheduleModuleController.get('/delete/:id', async (req, res) => {
  const id = req.params.id

  const schedule = await scheduleModel.findById(id).populate('details')

  await scheduleDetailModel.deleteMany({
    _id: { $in: schedule.details.map((detail) => detail._id) },
  })

  await scheduleModel.findByIdAndDelete(id)

  res.redirect('/admin/schedule?success=delete')
})

module.exports = adminScheduleModuleController
