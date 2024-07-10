const { getAuth } = require('firebase-admin/auth')
const { userModel } = require('../models/index.js')

async function isSSU(req, res, next) {
  const sessionCookie = req.cookies.session

  if (!sessionCookie) {
    res.redirect('/auth/signin')
    return
  }

  try {
    const decodedToken = await getAuth().verifySessionCookie(
      sessionCookie,
      true
    )

    const user = await userModel.findOne({ email: decodedToken.email })

    if (user.role !== 'ssu') {
      res.redirect('/403.html')
      return next()
    }

    return next()
  } catch (error) {
    res.redirect('/auth/signin')
    return next()
  }
}

module.exports = isSSU
