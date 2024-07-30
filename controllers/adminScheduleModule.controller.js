const e = require('express')
const {
  scheduleModel,
  scheduleDetailModel,
  notificationModel,
  reservationApprovalModel,
} = require('../models/index.js')
const moment = require('moment-timezone')
const mongoose = require('../utils/mongoose.js')
const {
  getWeekdays,
  getSaturdays,
  mergeDateAndTime,
  getDateChanges,
} = require('../utils/dateUtil.js')
const isSSU = require('../utils/isSSU.js')
const emailTransporter = require('../utils/email.js')
require('dotenv').config()

const adminScheduleModuleController = e.Router()

adminScheduleModuleController.get('/', isSSU, async (req, res) => {
  const line = req.query.line

  if (!line) {
    return res.redirect('/admin/schedule?line=1')
  }
  const schedules = await scheduleModel.find({ line })

  res.render('adminScheduleModule/schedule.ejs', { schedules })
})

adminScheduleModuleController.get('/create', isSSU, (req, res) => {
  res.render('adminScheduleModule/create.ejs')
})

adminScheduleModuleController.post('/create', isSSU, async (req, res) => {
  const { line, from, to, label, schedules } = req.body

  const fromStr = moment(from).tz('Asia/Manila').format('MMM D')
  const toStr = moment(to).tz('Asia/Manila').format('MMM D')
  const dateRange = `${fromStr} - ${toStr}`
  const schedule = new scheduleModel({ line, dateRange, label })

  const weekdays = getWeekdays(from, to)
  const saturdays = getSaturdays(from, to)

  const toDesWeekdays = mergeDateAndTime(weekdays, schedules[0].weekdays)
  const toDesSaturdays = mergeDateAndTime(saturdays, schedules[0].saturdays)
  const toDesDates = toDesWeekdays.concat(toDesSaturdays)

  const returnWeekdays = mergeDateAndTime(weekdays, schedules[1].weekdays)
  const returnSaturdays = mergeDateAndTime(saturdays, schedules[1].saturdays)
  const returnDates = returnWeekdays.concat(returnSaturdays)

  const toDesDetails = toDesDates.map((time) => {
    return {
      from: schedules[0].from,
      to: schedules[0].to,
      time,
    }
  })

  const returnDetails = returnDates.map((time) => {
    return {
      from: schedules[1].from,
      to: schedules[1].to,
      time,
    }
  })

  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const scheduleDoc = await schedule.save({ session })

      const scheduleDetails = await scheduleDetailModel.insertMany(
        toDesDetails.concat(returnDetails),
        {
          session,
        }
      )
      await scheduleModel.findByIdAndUpdate(
        scheduleDoc._id,
        {
          $push: { details: scheduleDetails },
        },
        { session }
      )
      res.send({ success: true })
    })
  } catch (err) {
    console.error(err)
    res.send({ success: false, error: err })
  }
  session.endSession()
})

adminScheduleModuleController.get(
  '/edit/single/:date',
  isSSU,
  async (req, res) => {
    const date = req.params.date
    const { line } = req.query

    if (!line) {
      return res.redirect(`/admin/schedule/edit/single/${date}?line=1`)
    }

    const schedules = await scheduleModel.aggregate([
      {
        $lookup: {
          from: 'ScheduleDetail',
          localField: 'details',
          foreignField: '_id',
          as: 'details',
        },
      },
      {
        $unwind: {
          path: '$details',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          line: 1,
          from: '$details.from',
          to: '$details.to',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$details.time',
              timezone: 'Asia/Manila',
            },
          },
          time: '$details.time',
        },
      },
      {
        $match: {
          date,
          line: parseInt(line),
        },
      },
    ])

    if (schedules.length === 0) {
      return res.redirect('/404.html')
    }

    // console.log(schedules)

    // get time
    /**
     [
        {
          from: 'DLSU MNL',
          to: 'DLSU LAG',
          weekdays: [ '15:39' ],
          saturdays: [ '15:40' ]
        },
        {
          from: 'DLSU LAG',
          to: 'DLSU MNL',
          weekdays: [ '17:39' ],
          saturdays: []
        }
      ]
     */
    const map = new Map()

    schedules.forEach((schedule) => {
      const key = `${schedule.from}${schedule.to}`
      map.set(key, map.get(key) ? map.get(key).concat(schedule) : [schedule])
    })
    const formattedSchedules = []

    for (const [key, value] of map) {
      const times = value.map((schedule) => {
        return schedule.time
      })

      const weekdays = times
        .filter((time) => moment(time).day() !== 6)
        .map((time) => moment(time).format('HH:mm'))
      const saturdays = times
        .filter((time) => moment(time).day() === 6)
        .map((time) => moment(time).format('HH:mm'))

      formattedSchedules.push({
        from: value[0].from,
        to: value[0].to,
        weekdays: [...new Set(weekdays)],
        saturdays: [...new Set(saturdays)],
      })
    }

    const schedule = await scheduleModel.findById(schedules[0]._id)

    const result = {
      id: schedule._id,
      dateRange: moment(date).tz('Asia/Manila').format('MMM D'),
      line: schedule.line,
      label: schedule.label,
      schedule: JSON.stringify(formattedSchedules),
    }
    console.log(result)
    return res.render('adminScheduleModule/editSingle.ejs', result)
  }
)

adminScheduleModuleController.post(
  '/edit/single/:date',
  isSSU,
  async (req, res) => {
    const { date } = req.params
    const { deletedTime, addedTime, label } = req.body

    const schedules = await scheduleDetailModel.aggregate([
      {
        $project: {
          _id: 1,
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
          date,
        },
      },
    ])

    const schedule = await scheduleModel.findOne({
      details: { $in: schedules.map((schedule) => schedule._id) },
    })

    if (!schedule) return res.redirect('/admin/schedule?error=edit')

    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        // create new scheduleModel with new dateRange and label
        const newSchedule = new scheduleModel({
          line: schedule.line,
          dateRange: moment(date).tz('Asia/Manila').format('MMM D'),
          label,
          details: schedules.map((schedule) => schedule._id),
        })
        await newSchedule.save({ session })
        // remove details of :date in scheduleModel
        await schedule.updateOne(
          {
            $pull: {
              details: { $in: schedules.map((schedule) => schedule._id) },
            },
          },
          { session }
        )

        await schedule.updateOne(
          {
            dateRange: `${schedule.dateRange.split(' - ')[0]} - ${moment(date)
              .tz('Asia/Manila')
              .subtract(1, 'days')
              .format('MMM D')}`,
          },
          { session }
        )

        if (
          schedule.dateRange.split(' - ')[1] !==
          moment(date).tz('Asia/Manila').format('MMM D')
        ) {
          // create new schedule for date after edited
          const newSchedule = new scheduleModel({
            line: schedule.line,
            dateRange: `${moment(date)
              .tz('Asia/Manila')
              .add(1, 'days')
              .format('MMM D')} - ${schedule.dateRange.split(' - ')[1]}`,
            label: schedule.label,
          })
          newSchedule.save({ session })

          // remove details of future date in scheduleModel
          const futureSchedules = await scheduleModel
            .findOne({
              details: {
                $elemMatch: {
                  time: {
                    $gte: moment(date)
                      .tz('Asia/Manila')
                      .add(1, 'days')
                      .format(),
                  },
                },
              },
            })
            .populate('details', { session })

          await schedule.updateOne(
            {
              $pull: {
                details: {
                  $in: futureSchedules.details.map((detail) => detail._id),
                },
              },
            },
            { session }
          )
        }

        schedule.save({ session })

        const newScheduleDoc = await scheduleModel
          .findById(newSchedule._id)
          .populate('details')

        // deletedTime = [{from, to, time, isWeekday}]
        // delete all time in deletedTime
        if (deletedTime) {
          const detailsToDelete = newScheduleDoc.details.filter((detail) => {
            // time is in different format, deletedTime is in format 'HH:mm'
            // details time is in format 'YYYY-MM-DDTHH:mm:ssZ'

            return deletedTime.some((time) => {
              return (
                time.from === detail.from &&
                time.to === detail.to &&
                time.time ===
                  moment(detail.time).tz('Asia/Manila').format('HH:mm') &&
                (!!time.isWeekday === moment(detail.time).day() < 6 ||
                  (time.isWeekday === 'false' &&
                    moment(detail.time).day() === 6))
              )
            })
          })

          const schedules = await scheduleDetailModel
            .find(
              {
                _id: { $in: detailsToDelete.map((detail) => detail._id) },
              },
              null,
              { session }
            )
            .populate({
              path: 'reserve',
              populate: { path: 'user', strictPopulate: false },
            })

          schedules.forEach(async (schedule) => {
            if (schedule.reserve && schedule.reserve.length > 0) {
              const emails = schedule.reserve.map(
                (reservation) => reservation.user.email
              )

              const from = schedule.from
              const to = schedule.to
              const time = moment(schedule.time)
                .tz('Asia/Manila')
                .format('MMM DD HH:mm')

              emailTransporter.sendMail({
                from: process.env.EMAIL_USER,
                to: emails,
                subject: 'Reservation Cancelled',
                text: `Your reservation from ${from} to ${to} at ${time} has been cancelled.`,
              })

              const users = schedule.reserve.map(
                (reservation) => reservation.user._id
              )

              await notificationModel.create(
                [
                  {
                    title: 'Reservation Cancelled',
                    description: `Your reservation from ${from} to ${to} at ${time} has been cancelled.`,
                    to: users,
                  },
                ],
                { session }
              )

              // update all approval
              await reservationApprovalModel.updateMany(
                {
                  _id: { $in: schedule.approval },
                },
                {
                  status: 'cancelled',
                },
                { session }
              )
            }
          })

          await scheduleDetailModel.deleteMany(
            {
              _id: { $in: detailsToDelete.map((detail) => detail._id) },
            },
            { session }
          )
        }

        // addedTime = [{from, to, weekdays, saturdays}]
        // add all time in addedTime
        if (addedTime) {
          const weekdays = getWeekdays(from, to)
          const saturdays = getSaturdays(from, to)

          const newSchedules = []

          addedTime.forEach((schedule) => {
            const weekdaySchedules = mergeDateAndTime(
              weekdays,
              schedule.weekdays
            )
            const saturdaySchedules = mergeDateAndTime(
              saturdays,
              schedule.saturdays
            )

            const dates = weekdaySchedules.concat(saturdaySchedules)

            dates.forEach((time) => {
              newSchedules.push({
                from: schedule.from,
                to: schedule.to,
                time,
              })
            })
          })

          const scheduleDetails = await scheduleDetailModel.insertMany(
            newSchedules,
            {
              session,
            }
          )

          await scheduleModel.findByIdAndUpdate(
            id,
            {
              $push: { details: scheduleDetails },
            },
            { session }
          )
        }
      })
    } catch (err) {
      console.error(err)
      return res.redirect('/admin/schedule?error=edit')
    }

    session.endSession()
  }
)

adminScheduleModuleController.get('/edit/:id', isSSU, async (req, res) => {
  const id = req.params.id

  const schedule = await scheduleModel.findById(id).populate('details')

  if (!schedule) {
    return res.redirect('404.html')
  }

  const from = moment(schedule.dateRange.split(' - ')[0], 'MMM D').format(
    'YYYY-MM-DD'
  )
  const to = moment(schedule.dateRange.split(' - ')[1], 'MMM D').format(
    'YYYY-MM-DD'
  )

  const map = new Map()

  schedule.details.forEach((detail) => {
    const key = `${detail.from}${detail.to}`
    map.set(key, map.get(key) ? map.get(key).concat(detail) : [detail])
  })

  const schedules = []

  for (const [key, value] of map) {
    const times = value.map((detail) => {
      return moment(detail.time).tz('Asia/Manila').format()
    })

    const weekdays = times
      .filter((time) => moment(time).day() !== 6)
      .map((time) => moment(time).format('HH:mm'))
    const saturdays = times
      .filter((time) => moment(time).day() === 6)
      .map((time) => moment(time).format('HH:mm'))

    schedules.push({
      from: value[0].from,
      to: value[0].to,
      weekdays: [...new Set(weekdays)],
      saturdays: [...new Set(saturdays)],
    })
  }
  console.log(schedules)

  res.render('adminScheduleModule/edit.ejs', {
    id: schedule._id,
    from,
    to,
    line: schedule.line,
    label: schedule.label,
    schedules: JSON.stringify(schedules),
  })
})

adminScheduleModuleController.post('/edit/:id', isSSU, async (req, res) => {
  const id = req.params.id
  const { deletedTime, addedTime, label, from, to } = req.body

  const schedule = await scheduleModel.findById(id).populate('details')

  if (!schedule) {
    return res.send({ success: false, error: 'Schedule not found' })
  }

  const fromStr = moment(from).tz('Asia/Manila').format('MMM D')
  const toStr = moment(to).tz('Asia/Manila').format('MMM D')

  const dateRange = `${fromStr} - ${toStr}`
  const originalDateRange = schedule.dateRange

  schedule.dateRange = dateRange
  schedule.label = label

  const session = await mongoose.startSession()

  try {
    await session.withTransaction(async () => {
      schedule.save()

      // if date range is changed
      if (dateRange !== originalDateRange) {
        // delete all details out of date range
        const oldStart = moment(
          originalDateRange.split(' - ')[0],
          'MMM D'
        ).format('YYYY-MM-DD')
        const oldEnd = moment(
          originalDateRange.split(' - ')[1],
          'MMM D'
        ).format('YYYY-MM-DD')
        const newStart = from
        const newEnd = to

        const changes = getDateChanges(oldStart, oldEnd, newStart, newEnd)
        console.log(changes)
        changes.forEach(async (change) => {
          if (change.type === 'add') {
            const day = moment(change.date).tz('Asia/Manila').day()

            let details
            if (day === 6) {
              details = schedule.details.filter(
                (date) => moment(date.time).day() === 6
              )
            } else {
              details = schedule.details.filter(
                (date) => moment(date.time).day() < 6
              )
            }

            const lines = details.map(
              (detail) => `${detail.from} - ${detail.to}`
            )
            const uniqueLines = [...new Set(lines)]

            const toTime = [
              ...new Set(
                details.map((detail) => {
                  const line = `${detail.from} - ${detail.to}`
                  if (line === uniqueLines[0]) {
                    return moment(detail.time).format('HH:mm')
                  }
                })
              ),
            ]
            const returnTime = [
              ...new Set(
                details.map((detail) => {
                  const line = `${detail.from} - ${detail.to}`
                  if (line === uniqueLines[1]) {
                    return moment(detail.time).format('HH:mm')
                  }
                })
              ),
            ]

            const newDetails = []
            toTime.forEach((time) => {
              if (time) {
                const formattedTime = moment(`${change.date} ${time}`)
                  .tz('Asia/Manila')
                  .format()
                newDetails.push({
                  from: uniqueLines[0].split(' - ')[0],
                  to: uniqueLines[0].split(' - ')[1],
                  time: formattedTime,
                })
              }
            })

            returnTime.forEach((time) => {
              if (time) {
                const formattedTime = moment(`${change.date} ${time}`)
                  .tz('Asia/Manila')
                  .format()
                newDetails.push({
                  from: uniqueLines[1].split(' - ')[0],
                  to: uniqueLines[1].split(' - ')[1],
                  time: formattedTime,
                })
              }
            })
            console.log(newDetails)
            const docs = await scheduleDetailModel.insertMany(newDetails, {
              session,
            })
            await scheduleModel.findByIdAndUpdate(
              id,
              {
                $push: { details: docs },
              },
              { session }
            )
          }
          if (change.type === 'delete') {
            const detailsToDelete = schedule.details.filter((detail) => {
              const date = moment(detail.time)
                .tz('Asia/Manila')
                .format('YYYY-MM-DD')

              return date === change.date
            })
            const ids = detailsToDelete.map((detail) => detail._id)
            await scheduleDetailModel.deleteMany(
              {
                _id: { $in: ids },
              },
              { session }
            )

            const newDetails = schedule.details.filter(
              (detail) => !detailsToDelete.includes(detail)
            )

            await scheduleModel.findByIdAndUpdate(
              id,
              {
                details: newDetails,
              },
              { session }
            )
          }
        })
      }

      // deletedTime = [{from, to, time, isWeekday}]
      // delete all time in deletedTime
      if (deletedTime) {
        const detailsToDelete = schedule.details.filter((detail) => {
          // time is in different format, deletedTime is in format 'HH:mm'
          // details time is in format 'YYYY-MM-DDTHH:mm:ssZ'

          return deletedTime.some((time) => {
            return (
              time.from === detail.from &&
              time.to === detail.to &&
              time.time ===
                moment(detail.time).tz('Asia/Manila').format('HH:mm') &&
              (!!time.isWeekday === moment(detail.time).day() < 6 ||
                (time.isWeekday === 'false' && moment(detail.time).day() === 6))
            )
          })
        })

        const schedules = await scheduleDetailModel
          .find(
            {
              _id: { $in: detailsToDelete.map((detail) => detail._id) },
            },
            null,
            { session }
          )
          .populate({
            path: 'reserve',
            populate: { path: 'user', strictPopulate: false },
          })

        schedules.forEach(async (schedule) => {
          if (schedule.reserve && schedule.reserve.length > 0) {
            const emails = schedule.reserve.map(
              (reservation) => reservation.user.email
            )

            const from = schedule.from
            const to = schedule.to
            const time = moment(schedule.time)
              .tz('Asia/Manila')
              .format('MMM DD HH:mm')

            emailTransporter.sendMail({
              from: process.env.EMAIL_USER,
              to: emails,
              subject: 'Reservation Cancelled',
              text: `Your reservation from ${from} to ${to} at ${time} has been cancelled.`,
            })

            const users = schedule.reserve.map(
              (reservation) => reservation.user._id
            )

            await notificationModel.create(
              [
                {
                  title: 'Reservation Cancelled',
                  description: `Your reservation from ${from} to ${to} at ${time} has been cancelled.`,
                  to: users,
                },
              ],
              { session }
            )

            // update all approval
            await reservationApprovalModel.updateMany(
              {
                _id: { $in: schedule.approval },
              },
              {
                status: 'cancelled',
              },
              { session }
            )
          }
        })

        await scheduleDetailModel.deleteMany(
          {
            _id: { $in: detailsToDelete.map((detail) => detail._id) },
          },
          { session }
        )
      }

      // addedTime = [{from, to, weekdays, saturdays}]
      // add all time in addedTime
      if (addedTime) {
        const weekdays = getWeekdays(from, to)
        const saturdays = getSaturdays(from, to)

        const newSchedules = []

        addedTime.forEach((schedule) => {
          const weekdaySchedules = mergeDateAndTime(weekdays, schedule.weekdays)
          const saturdaySchedules = mergeDateAndTime(
            saturdays,
            schedule.saturdays
          )

          const dates = weekdaySchedules.concat(saturdaySchedules)

          dates.forEach((time) => {
            newSchedules.push({
              from: schedule.from,
              to: schedule.to,
              time,
            })
          })
        })

        const scheduleDetails = await scheduleDetailModel.insertMany(
          newSchedules,
          {
            session,
          }
        )

        await scheduleModel.findByIdAndUpdate(
          id,
          {
            $push: { details: scheduleDetails },
          },
          { session }
        )
      }
    })
    res.send({ success: true })
  } catch (err) {
    console.error(err)
    res.send({ success: false, error: err })
  }

  session.endSession()
})

adminScheduleModuleController.get('/delete/:id', isSSU, async (req, res) => {
  const id = req.params.id

  const schedule = await scheduleModel.findById(id).populate('details')

  if (!schedule) {
    return res.redirect('404.html')
  }

  const schedules = await scheduleDetailModel
    .find({
      _id: { $in: schedule.details.map((detail) => detail._id) },
    })
    .populate({
      path: 'reserve',
      populate: { path: 'user', strictPopulate: false },
    })

  const session = await mongoose.startSession()

  try {
    await session.withTransaction(async () => {
      await Promise.all(
        schedules.map(async (schedule) => {
          const from = schedule.from
          const to = schedule.to
          const time = moment(schedule.time)
            .tz('Asia/Manila')
            .format('MMM DD HH:mm')
          let emails = []

          if (schedule.reserve && schedule.reserve.length > 0) {
            // console.log(schedule.reserve[0].user)
            emails = schedule.reserve.map((reservation) => {
              return reservation.user.email
            })

            const users = schedule.reserve.map(
              (reservation) => reservation.user._id
            )

            await notificationModel.create(
              [
                {
                  title: 'Reservation Cancelled',
                  description: `Your reservation from ${from} to ${to} at ${time} has been cancelled.`,
                  to: users,
                },
              ],
              { session }
            )
          }

          // delete all approval
          await reservationApprovalModel.updateMany(
            {
              _id: { $in: schedule.approval },
            },
            {
              status: 'cancelled',
            },
            { session }
          )

          await scheduleDetailModel.findByIdAndDelete(schedule._id, { session })

          if (emails.length > 0) {
            emailTransporter.sendMail({
              from: process.env.EMAIL_USER,
              to: emails,
              subject: 'Reservation Cancelled',
              text: `Your reservation from ${from} to ${to} at ${time} has been cancelled.`,
            })
          }
        })
      )

      // await scheduleDetailModel.deleteMany({
      //   _id: { $in: schedule.details.map((detail) => detail._id) },
      // })

      await scheduleModel.findByIdAndDelete(id, { session })

      res.redirect('/admin/schedule?success=delete')
    })
  } catch (err) {
    console.error(err)
    res.redirect('/admin/schedule?error=delete')
  }

  session.endSession()
})

module.exports = adminScheduleModuleController
