const e = require('express')
const moment = require('moment-timezone')
const { scheduleDetailModel, userModel } = require('../models/index.js')

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

  console.log(from, to, time, date)

  if (!schedule && from && to && time && date) {
    res.redirect('/admin/checkin?error=no-schedule')
    return
  }

  const passengerList = schedule?.reserve.map((passenger) => {
    return {
      name: passenger.user.name,
      id: passenger.user.idNumber,
      status: passenger.status,
    }
  })

  const reservedCount = schedule?.reserve.length
  const slotCount = schedule?.slot + reservedCount
  const presentCount = schedule?.reserve.filter(
    (passenger) => passenger?.status === 'present'
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

adminCheckInController.get('/result', async (req, res) => {
  const { from, to, time, date, passengerId } = req.query

  const schedule = await getScheduleDetail(from, to, time, date)

  if (!schedule && from && to && time && date) {
    res.redirect('/admin/checkin?error=no-schedule')
    return
  }

  const passenger = schedule?.reserve.find(
    (passenger) => passenger.user.idNumber === Number(passengerId)
  )

  const passengerInfo = await userModel.findOne(
    { idNumber: passengerId },
    { designation: true, name: true, idNumber: true, _id: true }
  )

  if (!passengerInfo) {
    res.render('adminCheckInModule/result.ejs', { invalid: true })
    return
  }

  if (!passenger) {
    res.render('adminCheckInModule/result.ejs', {
      reserved: false,
      passengerInfo,
    })
    return
  }

  const doc = await scheduleDetailModel.findOne({
    _id: schedule._id,
    'reserve._id': passengerInfo._id,
  })

  await scheduleDetailModel.updateOne(
    { _id: schedule._id, 'reserve._id': passengerInfo._id },
    {
      $set: {
        'reserve.$.status': 'present',
      },
    }
  )

  res.render('adminCheckInModule/result.ejs', { reserve: true, passengerInfo })
})

module.exports = adminCheckInController
