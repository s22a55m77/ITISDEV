const e = require('express')
const { scheduleDetailModel } = require('../models/index.js')
const httpContext = require('express-http-context')
const isAuthorized = require('../utils/isAuthorized.js')
const moment = require('moment-timezone')

const reservationModuleController = e.Router()

async function getCommonTime(from, to, date) {
  const schedule = await scheduleDetailModel.aggregate([
    {
      $match: {
        from,
        to,
      },
    },
    {
      $project: {
        slot: true,
        time: true,
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$time',
            timezone: 'Asia/Manila',
          },
        },
      },
    },
    {
      $match: {
        date: {
          $in: date,
        },
        slot: {
          $gte: 1,
        },
      },
    },
    {
      $project: {
        slot: true,
        time: {
          $dateToString: {
            format: '%H:%M',
            date: '$time',
            timezone: 'Asia/Manila',
          },
        },
      },
    },
    {
      $group: {
        _id: '$time',
        count: { $sum: 1 }, // Count occurrences of each time
      },
    },
    {
      $match: {
        count: date.length,
      },
    },
    {
      $project: {
        _id: 0,
        time: '$_id',
      },
    },
  ])

  if (schedule.length != 0) return schedule.map((s) => s.time)

  return []
}

async function getSchedules(from, to, timeList) {
  const schedules = await scheduleDetailModel.aggregate([
    {
      $match: {
        from,
        to,
      },
    },
    {
      $project: {
        _id: true,
        slot: true,
        time: {
          $dateToString: {
            format: '%H:%M',
            date: '$time',
            timezone: 'Asia/Manila',
          },
        },
      },
    },
    {
      $match: {
        time: {
          $in: timeList,
        },
      },
    },
    {
      $group: {
        _id: '$time',
        slot: { $min: '$slot' },
        sid: { $push: '$_id' },
      },
    },
    {
      $project: {
        _id: 0,
        slot: true,
        time: '$_id',
        sid: true,
      },
    },
  ])

  return schedules.map((s) => ({ ids: s.sid, slot: s.slot, time: s.time }))
}

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

reservationModuleController.post('/departure', async (req, res) => {
  const { date, from, to } = req.body

  const timeList = await getCommonTime(from, to, date)

  const schedules = await getSchedules(from, to, timeList)

  /**
   * [
        {
            "ids": [
                "6688c5fa52edeaa2a2864630",
                "6688d31e1229e21193bf63c3"
            ],
            "slot": 1,
            "time": "12:20"
        }
    ]
   * 
   */

  res.send({ schedules })
})

reservationModuleController.post('/return', async (req, res) => {
  const { date, from, to } = req.body

  const timeList = await getCommonTime(to, from, date)

  const schedules = await getSchedules(to, from, timeList)

  res.send({ schedules })
})

reservationModuleController.post('/success', isAuthorized, async (req, res) => {
  const { ids } = req.body
  const user = httpContext.get('user')

  try {
    await scheduleDetailModel.updateMany(
      {
        _id: {
          $in: ids,
        },
      },
      {
        $inc: {
          slot: -1,
        },
        $push: {
          reserve: user,
        },
      }
    )
    return res.render('reservationModule/success.ejs', { success: true })
  } catch (error) {
    console.error(error)
    return res.render('reservationModule/success.ejs', { success: false })
  }

  res.send({})
})

module.exports = reservationModuleController
