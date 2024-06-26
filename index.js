const e = require('express')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

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
