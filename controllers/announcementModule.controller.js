const e = require('express')
const isAuthorized = require('../utils/isAuthorized.js')
const httpContext = require('express-http-context')
const { announcementModel, userModel } = require('../models/index.js')

const announcementModuleController = e.Router()

announcementModuleController.get('/', isAuthorized, async (req, res) => {
  const announcements = await announcementModel.find()

  res.render('announcementModule/announcement.ejs', { announcements })
})

announcementModuleController.get('/:id', isAuthorized, async (req, res) => {
  const user = httpContext.get('user')

  const id = req.params.id
  const announcement = await announcementModel.findById(id).catch((error) => {
    console.error(error)
  })

  if (!announcement) return res.redirect('/404.html')

  if (!announcement.read.includes(user._id)) {
    await announcementModel.findByIdAndUpdate(id, {
      $push: { read: user },
    })
  }

  res.render('announcementModule/announcementDetail.ejs', {
    title: announcement.title,
    description: announcement.description,
  })
})

module.exports = announcementModuleController
