const e = require('express')
const moment = require('moment-timezone')
const { scheduleDetailModel, userModel } = require('../models/index.js')
const isDispatcher = require('../utils/isDispatcher.js')

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
      $unwind: {
        path: '$reserve',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'User',
        localField: 'reserve.user',
        foreignField: '_id',
        as: 'reserve.userDetails',
      },
    },
    {
      $unwind: {
        path: '$reserve.userDetails',
        preserveNullAndEmptyArrays: true,
      },
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

adminCheckInController.get('/', isDispatcher, async (req, res) => {
  const { from, to, time, date } = req.query

  const schedule = await getScheduleDetail(from, to, time, date)

  console.log(from, to, time, date)

  if (!schedule && from && to && time && date) {
    res.redirect('/admin/checkin?error=no-schedule')
    return
  }

  const passengerList = []
  schedule?.reserve.forEach((passenger) => {
    console.log(passenger)
    if (passenger.user.name)
      passengerList.push({
        name: passenger.user.name,
        id: passenger.user.idNumber,
        status: passenger.status,
      })
  })

  const reservedCount = passengerList.length
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

adminCheckInController.get('/time', isDispatcher, async (req, res) => {
  const { from, to, date } = req.query

  const schedule = await scheduleDetailModel.aggregate([
    {
      $match: {
        from,
        to,
      },
    },
    {
      $project: {
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$time',
            timezone: 'Asia/Manila',
          },
        },
        time: true,
      },
    },
    {
      $match: {
        date,
      },
    },
    {
      $project: {
        time: {
          $dateToString: {
            format: '%H:%M',
            date: '$time',
            timezone: 'Asia/Manila',
          },
        },
      },
    },
  ])

  if (schedule.length != 0) {
    const timeList = schedule.map((detail) => detail.time)
    res.send({ success: true, timeList })
    return
  }

  res.send({ success: false })
})

adminCheckInController.get('/scan', isDispatcher, (req, res) => {
  res.render('adminCheckInModule/scan.ejs')
})

adminCheckInController.get('/result', isDispatcher, async (req, res) => {
  const { from, to, time, date, passengerId } = req.query

  const schedule = await getScheduleDetail(from, to, time, date)

  if (!schedule && from && to && time && date) {
    res.redirect('/admin/checkin?error=no-schedule')
    return
  }

  let numberPassengerId
  try {
    numberPassengerId = Number(passengerId)
  } catch (error) {
    console.error(error)
    return res.render('adminCheckInModule/result.ejs', { invalid: true })
  }

  const passenger = schedule?.reserve.find(
    (passenger) => passenger.user.idNumber === numberPassengerId
  )

  const passengerInfo = await userModel.findOne(
    { idNumber: passengerId },
    { designation: true, name: true, idNumber: true, _id: true }
  )

  if (!passengerInfo) {
    res.render('adminCheckInModule/result.ejs', {
      invalid: true,
      reserve: false,
      passengerInfo: {},
    })
    return
  }

  if (!passenger) {
    res.render('adminCheckInModule/result.ejs', {
      invalid: false,
      reserve: false,
      passengerInfo,
    })
    return
  }

  const doc = await scheduleDetailModel.findOne({
    _id: schedule._id,
    'reserve._id': passengerInfo._id,
  })

  await scheduleDetailModel.updateOne(
    { _id: schedule._id, 'reserve.user': passengerInfo._id },
    {
      $set: {
        'reserve.$.status': 'present',
      },
    }
  )

  res.render('adminCheckInModule/result.ejs', {
    invalid: false,
    reserve: true,
    passengerInfo,
  })
})

module.exports = adminCheckInController
