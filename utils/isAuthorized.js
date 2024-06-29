const { getAuth } = require('firebase-admin/auth')

function isAuthorized(req, res, next) {
  const sessionCookie = req.cookies.session

  if (!sessionCookie) {
    res.redirect('/auth/signin')
    return
  }

  getAuth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      return next()
    })
    .catch(() => {
      res.redirect('/auth/signin')
      return next()
    })
}

module.exports = isAuthorized
