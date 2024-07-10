const { getAuth } = require('firebase-admin/auth')
const { userModel } = require('../models/index.js')

async function isDispatcher(req, res, next) {
  const sessionCookie = req.cookies.session

  if (!sessionCookie) {
    res.redirect('/admin/auth/signin')
    return
  }

  try {
    const decodedToken = await getAuth().verifySessionCookie(
      sessionCookie,
      true
    )

    const user = await userModel.findOne({ email: decodedToken.email })

    if (user.role !== 'dispatcher') {
      res.redirect('/403.html')
      return next()
    }

    return next()
  } catch (error) {
    res.redirect('/admin/auth/signin')
    return next()
  }
}

module.exports = isDispatcher
