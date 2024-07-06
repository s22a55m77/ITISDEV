const e = require('express')
const httpContext = require('express-http-context')
const {
  scheduleDetailModel,
  reservationApprovalModel,
} = require('../models/index.js')
const moment = require('moment-timezone')
const isAuthorized = require('../utils/isAuthorized')
const { DocumentSnapshot } = require('firebase-admin/firestore')

const myTripModuleController = e.Router()

myTripModuleController.get('/', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')

  const histories = await scheduleDetailModel.aggregate([
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
        'approval.user': user._id,
      },
    },
    {
      $sort: {
        time: -1,
      },
    },
  ])

  if (!histories) {
    return res.render('myTripModule/myTrip.ejs')
  }

  const tripList = histories.map((history) => {
    return {
      id: history.approval._id,
      from: history.from,
      to: history.to,
      date: moment(history.time).tz('Asia/Manila').format('YYYY-MM-DD'),
      time: moment(history.time).tz('Asia/Manila').format('hh:mm'),
      status: history.approval.status,
    }
  })

  res.render('myTripModule/myTrip.ejs', { tripList })
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
