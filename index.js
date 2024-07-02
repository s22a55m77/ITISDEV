const e = require('express')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const httpContext = require('express-http-context')

const { initializeApp, cert } = require('firebase-admin/app')

const {
  registrationModuleController,
  profileModuleController,
  announcementModuleController,
  adminAnnouncementModuleController,
  landingController,
  adminReservationModuleController
} = require('./controllers/index.js')

const print = require('./utils/printRoute')

require('dotenv').config()

const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY)

initializeApp({
  credential: cert({
    type: 'service_account',
    projectId: 'itisdev',
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: 'googleapis.com',
  }),
})

const app = e()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(fileUpload())
app.use(httpContext.middleware)

app.use(e.static('public'))

app.set('view engine', 'ejs')

app.use('/auth', registrationModuleController)
app.use('/profile', profileModuleController)
app.use('/admin/announcement', adminAnnouncementModuleController)
app.use('/announcement', announcementModuleController)
app.use('/', landingController)
app.use('/admin/reservation', adminReservationModuleController)

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.SERVER_PORT || 3000))
  app._router.stack.forEach(print.bind(null, []))
})
