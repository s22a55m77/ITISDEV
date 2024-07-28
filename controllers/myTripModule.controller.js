const e = require('express')
const httpContext = require('express-http-context')
const {
  scheduleModel,
  scheduleDetailModel,
  reservationApprovalModel,
} = require('../models/index.js')
const moment = require('moment-timezone')
const isAuthorized = require('../utils/isAuthorized')
const { ObjectId } = require('mongoose').Types

const myTripModuleController = e.Router()

myTripModuleController.get('/', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')

  const histories = await reservationApprovalModel.find({
    user: user._id,
  }).sort({ time: -1 })

  // const histories = await scheduleDetailModel.aggregate([
  //   {
  //     $lookup: {
  //       from: 'ReservationApproval',
  //       localField: 'approval',
  //       foreignField: '_id',
  //       as: 'approval',
  //     },
  //   },
  //   {
  //     $unwind: '$approval',
  //   },
  //   {
  //     $match: {
  //       'approval.user': user._id,
  //     },
  //   },
  //   {
  //     $sort: {
  //       time: -1,
  //     },
  //   },
  // ])

  if (!histories) {
    return res.render('myTripModule/myTrip.ejs')
  }
  console.log(histories)
  const tripList = histories.map((history) => {
    return {
      id: history._id,
      from: history.from,
      to: history.to,
      date: moment(history.time).tz('Asia/Manila').format('YYYY-MM-DD'),
      time: moment(history.time).tz('Asia/Manila').format('hh:mm'),
      status: history.status,
    }
  })
  console.log(tripList)
  res.render('myTripModule/myTrip.ejs', { tripList })
})

myTripModuleController.get('/:id', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')
  const { id } = req.params

  const schedule = await scheduleDetailModel.aggregate([
    {
      $lookup: {
        from: 'ReservationApproval',
        localField: 'approval',
        foreignField: '_id',
        as: 'approval',
      },
    },
    {
      $unwind: '$approval',
    },
    {
      $match: {
        'approval._id': new ObjectId(id),
        'approval.user': user._id,
      },
    },
    {
      $project: {
        approval: 1,
        from: 1,
        to: 1,
        time: 1,
      },
    },
  ])

  if (!schedule) return res.redirect('404.html')

  const detail = {
    id: schedule[0].approval._id,
    from: schedule[0].from,
    to: schedule[0].to,
    departureTime: moment(schedule[0].time).tz('Asia/Manila').format('hh:mm'),
    departureDate: moment(schedule[0].time).tz('Asia/Manila').format('MMM DD'),
    status: schedule[0].approval.status,
  }

  res.render('myTripModule/tripDetail.ejs', { detail })
})

myTripModuleController.post('/cancel/:id', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')
  const { id } = req.params

  const approval = await reservationApprovalModel.findOne({
    _id: id,
    user: user._id,
  })

  if (!approval) {
    res.redirect('/trip?error=no-approval-found')
  }

  await reservationApprovalModel.updateOne(
    { _id: id },
    {
      status: 'cancelled',
    }
  )

  const schedule = await scheduleDetailModel.findOne({
    approval: {
      $in: [id],
    },
  })

  if (approval.status === 'confirmed') {
    await scheduleDetailModel.updateOne(
      { _id: schedule._id },
      {
        $pull: { reserve: user._id },
        $inc: { slot: 1 },
      }
    )
  }

  res.redirect('/trip?success=cancelled')
})

module.exports = myTripModuleController
