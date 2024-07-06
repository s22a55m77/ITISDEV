const e = require('express')
const moment = require('moment-timezone')
const { scheduleDetailModel } = require('../models/index.js')

const adminCheckInController = e.Router()

async function getScheduleDetail(from, to, time, date) {
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
        reserve: true,

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
        time,
        date,
      },
    },
    {
      $unwind: '$reserve',
    },
    {
      $lookup: {
        from: 'User',
        localField: 'reserve._id',
        foreignField: '_id',
        as: 'reserve.userDetails',
      },
    },
    {
      $unwind: '$reserve.userDetails',
    },
    {
      $group: {
        _id: '$_id',
        slot: { $first: '$slot' },
        time: { $first: '$time' },
        date: { $first: '$date' },
        reserve: {
          $push: {
            user: {
              _id: '$reserve.userDetails._id',
              name: '$reserve.userDetails.name',
              idNumber: '$reserve.userDetails.idNumber',
            },
            status: '$reserve.status',
          },
        },
      },
    },
  ])
  return schedule[0] || null
}

adminCheckInController.get('/', async (req, res) => {
  const { from, to, time, date } = req.query

  const schedule = await getScheduleDetail(from, to, time, date)

  if (!schedule) {
    res.redirect('/admin/checkin?error=no-schedule')
  }

  const passengerList = schedule.reserve.map((passenger) => {
    return {
      name: passenger.user.name,
      id: passenger.user.idNumber,
      status: passenger.status,
    }
  })

  const slotCount = schedule.slot
  const reservedCount = schedule.reserve.length
  const presentCount = schedule.reserve.filter(
    (passenger) => passenger.status === 'present'
  ).length
  const walkInCount = slotCount - presentCount

  res.render('adminCheckInModule/checkIn.ejs', {
    slotCount,
    reservedCount,
    presentCount,
    walkInCount,
    passengerList,
  })
})

adminCheckInController.get('/scan', (req, res) => {
  res.render('adminCheckInModule/scan.ejs')
})

adminCheckInController.get('/result', (req, res) => {
  res.render('adminCheckInModule/result.ejs')
})

module.exports = adminCheckInController
