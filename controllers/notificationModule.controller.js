const e = require('express')
const { notificationModel } = require('../models/index.js')
const { ObjectId } = require('mongoose').Types

const notificationModuleController = e.Router()

notificationModuleController.get('/', async (req, res) => {
  const notifications = await notificationModel.find({
    to: {
      $in: [user._id],
    },
  })

  res.render('notificationModule/notification.ejs', { notifications })
})

notificationModuleController.get('/detail/:id', async (req, res) => {
  const id = req.params.id

  const notification = await notificationModel.find({
    $and: {
      to: {
        $in: [user._id],
      },
      _id: new ObjectId(id),
    },
  })

  res.render('notificationModule/notificationDetail.ejs', { notification })
})

module.exports = notificationModuleController
