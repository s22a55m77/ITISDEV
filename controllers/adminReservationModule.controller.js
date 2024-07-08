const e = require('express')
const {
  scheduleModel,
  scheduleDetailModel,
  reservationApprovalModel,
} = require('../models/index.js')
const moment = require('moment-timezone')
const { findNearestAndSurrounding } = require('../utils/dateUtil.js')

const adminReservationModuleController = e.Router()

adminReservationModuleController.get('/', async (req, res) => {
  const { selectedDate, selectedTime, line } = req.query

  if (!line) {
    res.redirect('/admin/reservation?line=1')
    return
  }

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
        line: Number(line) || 1,
      },
    },
    {
      $project: {
        details: {
          _id: true,
          from: true,
          to: true,
          slot: true,
          time: true,
        },
      },
    },
  ])

  if (!schedule[0]) {
    res.render('adminReservationModule/reservation.ejs', {
      dateList: [],
      timeList: [],
      passengerList: [],
    })
    return
  }

  const days = []
  schedule[0].details.forEach((detail) =>
    days.push(moment(detail.time).tz('Asia/Manila').format('YYYY-MM-DD'))
  )

  const uniqueDays = [...new Set(days)]

  if (!selectedDate) {
    const today = moment.tz('Asia/Manila').format('YYYY-MM-DD')

    const nearestAndSurroundingTimes = findNearestAndSurrounding(
      uniqueDays,
      today
    )

    // const firstDate

    res.redirect(
      `/admin/reservation?line=${line}&selectedDate=${nearestAndSurroundingTimes[2]}`
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
      slot: detail.slot,
      time: moment(detail.time).tz('Asia/Manila').format('HH:mm'),
    }
    map.set(detail.from, existing ? existing.concat(obj) : [obj])
  })

  const timeList = []

  for (const [key, value] of map.entries()) {
    if (
      key === 'DLSU MNL' ||
      key === 'PASEO' ||
      key === 'CARMONA' ||
      key === 'PAVILION' ||
      key === 'WALTER'
    )
      timeList[0] = value
    else timeList[1] = value
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
        _id: approval._id,
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
    passengerList: JSON.stringify(passengerList || []),
  })
})

adminReservationModuleController.post('/confirm', async (req, res) => {
  const id = req.body.id

  try {
    const approval = await reservationApprovalModel.findByIdAndUpdate(
      id,
      {
        status: 'confirmed',
      },
      { new: false }
    )
    let schedule
    if (approval.status !== 'confirmed') {
      schedule = await scheduleDetailModel.findOneAndUpdate(
        {
          approval: {
            $in: id,
          },
        },
        {
          $push: {
            reserve: approval.user,
          },
          $inc: {
            slot: -1,
          },
        },
        {
          new: true,
        }
      )
    }
    res.send({ success: true, id: schedule._id, slot: schedule.slot })
  } catch (error) {
    console.error(error)
    res.send({ success: false, error: error })
  }
})

adminReservationModuleController.post('/reject', async (req, res) => {
  const id = req.body.id

  try {
    const doc = await reservationApprovalModel.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
      },
      { new: false }
    )

    let schedule

    // if from confirm to rejected
    if (doc.status === 'confirmed') {
      schedule = await scheduleDetailModel.findOneAndUpdate(
        {
          approval: {
            $in: id,
          },
        },
        {
          $pull: {
            reserve: doc.user,
          },
          $inc: {
            slot: 1,
          },
        },
        {
          new: true,
        }
      )
    }

    res.send({ success: true, id: schedule._id, slot: schedule.slot })
  } catch (error) {
    console.error(error)
    res.send({ success: false, error: error })
  }
})

adminReservationModuleController.post('/confirm/all', async (req, res) => {
  const ids = req.body.ids

  try {
    const approval = await reservationApprovalModel.find({
      _id: { $in: ids },
      $and: {
        status: {
          $ne: 'confirmed',
        },
      },
    })

    await reservationApprovalModel.updateMany(
      { _id: { $in: ids } },
      { status: 'confirmed' }
    )

    const users = approval.map((approval) => approval.user)

    const schedule = await scheduleDetailModel.findOneAndUpdate(
      {
        approval: {
          $in: ids,
        },
      },
      {
        $push: {
          reserve: {
            $each: users,
          },
        },
        $inc: {
          slot: -users.length,
        },
      },
      {
        new: true,
      }
    )

    res.send({ success: true, id: schedule._id, slot: schedule.slot })
  } catch (error) {
    console.error(error)
    res.send({ success: false, error: error })
  }
})

module.exports = adminReservationModuleController
