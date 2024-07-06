const e = require('express')
const { scheduleDetailModel } = require('../models/index.js')
const moment = require('moment-timezone')

const reservationModuleController = e.Router()

reservationModuleController.get('/date', async (req, res) => {
  const { from, to } = req.query

  const schedule = await scheduleDetailModel.aggregate([
    {
      $match: {
        from,
        to,
        time: {
          $gte: new Date(),
        },
      },
    },
    {
      $project: {
        time: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$time',
            timezone: 'Asia/Manila',
          },
        },
      },
    },
  ])

  if (schedule.length === 0) return res.send({ success: false })

  const weekdays = []
  const saturdays = []

  schedule.forEach((s) => {
    const date = moment(s.time).tz('Asia/Taipei')
    if (date.day() === 6) {
      saturdays.push(s.time)
    } else {
      weekdays.push(s.time)
    }
  })

  res.send({ weekdays, saturdays })
})

reservationModuleController.get('/', (req, res) => {
  res.render('reservationModule/reserveTrip.ejs')
})

module.exports = reservationModuleController
