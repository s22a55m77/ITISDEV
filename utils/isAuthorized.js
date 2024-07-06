const { getAuth } = require('firebase-admin/auth')
const httpContext = require('express-http-context')
const { userModel } = require('../models/index.js')

async function isAuthorized(req, res, next) {
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

    httpContext.set('user', user)

    return next()
  } catch (error) {
    res.redirect('/auth/signin')
    return next()
  }
}

module.exports = isAuthorized
