const { getAuth } = require('firebase-admin/auth')
const { userModel } = require('../models/index.js')

async function isDispatcher(req, res, next) {
  const sessionCookie = req.cookies.session

  if (!sessionCookie) {
    return res.redirect('/admin/auth/signin')
  }

  try {
    const decodedToken = await getAuth().verifySessionCookie(
      sessionCookie,
      true
    )

    const user = await userModel.findOne({ email: decodedToken.email })

    if (user.role !== 'dispatcher') {
      return res.redirect('/403.html')
    }

    return next()
  } catch (error) {
    return res.redirect('/admin/auth/signin')
  }
}

module.exports = isDispatcher
