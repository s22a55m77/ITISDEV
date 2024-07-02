const e = require('express')
const {
  scheduleModel,
  scheduleDetailModel,
  reservationApprovalModel,
} = require('../models/index.js')
const moment = require('moment-timezone')
const { findNearestAndSurrounding } = require('../utils/dateUtil.js')

const adminReservationModuleController = e.Router()

adminReservationModuleController.get('/test', async (req, res) => {
  const today = moment.tz('Asia/Manila').format('YYYY-MM-DD')

  const schedule = await scheduleModel.aggregate([
    {
      $lookup: {
        from: 'ScheduleDetail',
        localField: 'details',
        foreignField: '_id',
        as: 'details',
      },
    },
    {
      $match: {
        line: 1,
      },
    },
    {
      $project: {
        details: {
          _id: true,
          time: true,
        },
      },
    },
  ])

  const days = []
  schedule[0].details.forEach((detail) =>
    days.push(moment(detail.time).tz('Asia/Manila').format('YYYY-MM-DD'))
  )

  const uniqueDays = [...new Set(days)]

  const nearestAndSurroundingTimes = findNearestAndSurrounding(
    uniqueDays,
    today
  )

  res.json({ schedule, nearestAndSurroundingTimes })
})

adminReservationModuleController.get('/', async (req, res) => {
  const { selectedDate, selectedTime, line } = req.query

  const schedule = await scheduleModel.aggregate([
    {
      $lookup: {
        from: 'ScheduleDetail',
        localField: 'details',
        foreignField: '_id',
        as: 'details',
      },
    },
    {
      $match: {
        line: 1,
      },
    },
    {
      $project: {
        details: {
          _id: true,
          from: true,
          to: true,
          time: true,
        },
      },
    },
  ])

  const days = []
  schedule[0].details.forEach((detail) =>
    days.push(moment(detail.time).tz('Asia/Manila').format('YYYY-MM-DD'))
  )

  const uniqueDays = [...new Set(days)]

  if (!line && !selectedDate) {
    const today = moment.tz('Asia/Manila').format('YYYY-MM-DD')

    const nearestAndSurroundingTimes = findNearestAndSurrounding(
      uniqueDays,
      today
    )

    // const firstDate

    res.redirect(
      `/admin/reservation?line=1&selectedDate=${nearestAndSurroundingTimes[2]}`
    )
    return
  }

  const nearestAndSurroundingTimes = findNearestAndSurrounding(
    uniqueDays,
    selectedDate
  )

  const details = schedule[0].details.filter(
    (detail) =>
      moment(detail.time).tz('Asia/Manila').format('YYYY-MM-DD') ===
      selectedDate
  )

  const map = new Map()
  details.forEach((detail) => {
    const existing = map.get(detail.from)
    const obj = {
      id: detail._id,
      time: moment(detail.time).tz('Asia/Manila').format('HH:mm'),
    }
    map.set(detail.from, existing ? existing.concat(obj) : [obj])
  })

  const timeList = []

  for (const [key, value] of map.entries()) {
    timeList.push(value)
  }

  let passengerList

  if (selectedTime) {
    passengerList = (
      await scheduleDetailModel.findById(selectedTime).populate({
        path: 'approval',
        populate: {
          path: 'user',
        },
      })
    ).approval.map((approval) => {
      return {
        name: approval.user.name,
        id: approval.user.idNumber,
        designation: approval.designation,
        purpose: approval.purpose,
        status: approval.status,
      }
    })
  }

  res.render('adminReservationModule/reservation.ejs', {
    dateList: JSON.stringify(nearestAndSurroundingTimes),
    timeList: JSON.stringify(timeList),
    passengerList: JSON.stringify(passengerList),
  })
})

module.exports = adminReservationModuleController
