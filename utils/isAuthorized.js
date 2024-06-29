const { getAuth } = require('firebase-admin/auth')
const httpContext = require('express-http-context')

function isAuthorized(req, res, next) {
  const sessionCookie = req.cookies.session

  if (!sessionCookie) {
    res.redirect('/auth/signin')
    return
  }

  getAuth()
    .verifySessionCookie(sessionCookie, true)
    .then(async (decodedToken) => {
      httpContext.set('userEmail', decodedToken.email)
      return next()
    })
    .catch(() => {
      res.redirect('/auth/signin')
      return next()
    })
}

module.exports = isAuthorized
