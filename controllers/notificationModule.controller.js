const e = require('express')
const { notificationModel } = require('../models/index.js')
const { ObjectId } = require('mongoose').Types
const isAuthorized = require('../utils/isAuthorized.js')
const httpContext = require('express-http-context')

const notificationModuleController = e.Router()

notificationModuleController.get('/', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')

  const notifications = await notificationModel.find({
    to: {
      $in: [user._id],
    },
  })

  res.render('notificationModule/notification.ejs', { notifications })
})

notificationModuleController.get(
  '/detail/:id',
  isAuthorized,
  async (req, res) => {
    const id = req.params.id
    const user = httpContext.get('user')

    const notification = await notificationModel.findOneAndUpdate({
      $and: {
        to: {
          $in: [user._id],
        },
        _id: new ObjectId(id),
      },
    }, {
      $push: {
        read: user,
      }
    }, {new: true})

    res.render('notificationModule/notificationDetail.ejs', { notification })
  }
)

module.exports = notificationModuleController
