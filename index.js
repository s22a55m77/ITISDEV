const e = require('express')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { initializeApp, cert } = require('firebase-admin/app')

require('dotenv').config()

initializeApp({
  credential: cert({
    type: 'service_account',
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
})

const app = e()

app.use(bodyParser.json())
app.use(cookieParser())

app.use(e.static('public'))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.SERVER_PORT || 3000))
})
