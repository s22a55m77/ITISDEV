const e = require('express')
const {
  scheduleDetailModel,
  reservationApprovalModel,
  imageModel,
} = require('../models/index.js')
const httpContext = require('express-http-context')
const isAuthorized = require('../utils/isAuthorized.js')
const moment = require('moment-timezone')
const mongoose = require('../utils/mongoose.js')

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

async function getSchedules(from, to, timeList, date) {
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
        time: {
          $in: timeList,
        },
        date: {
          $in: date,
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

reservationModuleController.get('/date', isAuthorized, async (req, res) => {
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

reservationModuleController.get('/', isAuthorized, (req, res) => {
  res.render('reservationModule/reserveTrip.ejs')
})

reservationModuleController.post(
  '/departure',
  isAuthorized,
  async (req, res) => {
    const { date, from, to, purpose } = req.body

    const timeList = await getCommonTime(from, to, date)

    const schedules = await getSchedules(from, to, timeList, date)

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

    res.render('reservationModule/departure.ejs', {
      schedules,
      from,
      to,
      date,
      purpose,
    })
  }
)

reservationModuleController.post('/return', isAuthorized, async (req, res) => {
  const { date, from, to, departureIds, departureTime, purpose } = req.body

  const timeList = await getCommonTime(to, from, date)

  const schedules = await getSchedules(to, from, timeList, date)

  res.render('reservationModule/return.ejs', {
    schedules,
    from,
    to,
    date,
    departureIds,
    departureTime,
    purpose,
  })
})

reservationModuleController.post('/success', isAuthorized, async (req, res) => {
  const { ids, purpose } = req.body
  const user = httpContext.get('user')

  const session = await mongoose.startSession()

  try {
    await session.withTransaction(async () => {
      if (
        user.designation ===
          'College - Manila Enrolled without Class/es in Laguna' ||
        user.designation ===
          'College - Laguna Enrolled without Class/es in Manila'
      ) {
        const approvals = []

        ids.forEach(() => {
          const approval = new reservationApprovalModel({
            user,
            designation: user.designation,
            purpose,
            status: 'pending',
          })

          approvals.push(approval)
        })

        const docs = await reservationApprovalModel.insertMany(approvals, {
          session,
        })

        ids.forEach(async (id, index) => {
          await scheduleDetailModel.findByIdAndUpdate(
            id,
            {
              $push: {
                approval: docs[index],
              },
            },
            { session }
          )
        })
      } else {
        const approvals = []

        ids.forEach(() => {
          const approval = new reservationApprovalModel({
            user,
            designation: user.designation,
            purpose,
            status: 'confirmed',
          })

          approvals.push(approval)
        })

        const docs = await reservationApprovalModel.insertMany(approvals, {
          session,
        })

        ids.forEach(async (id, index) => {
          await scheduleDetailModel.findByIdAndUpdate(
            id,
            {
              $inc: {
                slot: -1,
              },
              $push: {
                approval: docs[index],
                reserve: {
                  user,
                },
              },
            },
            { session }
          )
        })
      }
    })

    res.render('reservationModule/success.ejs', { success: true })
  } catch (error) {
    console.error(error)
    res.render('reservationModule/success.ejs', { success: false })
  }

  session.endSession()
})

reservationModuleController.post('/confirm', isAuthorized, async (req, res) => {
  const {
    date,
    from,
    to,
    departureIds,
    returnIds,
    departureTime,
    returnTime,
    purpose,
  } = req.body

  res.render('reservationModule/confirm.ejs', {
    date,
    from,
    to,
    departureIds,
    returnIds,
    departureTime,
    returnTime,
    purpose,
  })
})

reservationModuleController.get(
  '/image/:location',
  isAuthorized,
  async (req, res) => {
    const { location } = req.params

    const image = await imageModel.findOne({
      location,
    })

    res.header('Content-Type', 'image/jpeg')
    res.send(image?.image)
  }
)

module.exports = reservationModuleController
