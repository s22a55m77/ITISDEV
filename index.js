const e = require('express')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { initializeApp, cert } = require('firebase-admin/app')

require('dotenv').config()

const { bookingConfirmationModule } = require('./controllers/index.js')

initializeApp({
  credential: cert({
    type: 'service_account',
    projectId: 'itisdev',
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: 'googleapis.com',
  }),
})

const notificationModuleController = require('./controllers/notificationModule.controller.js')

const app = e()

app.use(bodyParser.json())
app.use(cookieParser())

app.use(e.static('public'))

app.set('view engine', 'ejs')

app.use('/notification', notificationModuleController)
app.use('/admin/booking', bookingConfirmationModule)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.SERVER_PORT || 3000))
})
