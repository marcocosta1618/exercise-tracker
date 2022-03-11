const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const createError = require('http-errors')
const userData = require('./models/userData')
// use bobyParser for POST requests
router.use('/api/users', bodyParser.urlencoded({ extended: false }))


// GET requests at root (initial page)
router.get('/', (req, res) => {
   res.sendFile(__dirname + '/views/index.html')
})

// GET and POST requests at '/api/users'
router.route('/api/users')
   // GET: get all users
   .get(async (req, res, next) => {
      try {
         // await userData.deleteMany({username: /^fcc_test_/}) // delete users created by fCC testing
         // await userData.deleteMany({})                       // delete all users
         const allUsers = await userData.find({}).select('username') // (_id is returned by default)
         res.send([...allUsers])
      } catch (error) {
         return next(error)
      }
   })
   // POST: create new user
   .post(async (req, res, next) => {
      try {
         const { username } = req.body
         const newUser = new userData({ username })
         await newUser.save()
         res.json({
            username: newUser.username,
            _id: newUser._id
         })
      } catch (error) {
         return next(error)
      }
   })

// GET: user exercise log at '/api/users/:_id/logs'
router.get('/api/users/:_id/logs', async (req, res, next) => {
   try {
      const { _id } = req.params
      const { from, to, limit } = req.query
      const [lowDateLim, highDateLim] = [new Date(from), new Date(to)]
      const user = await userData.findById(_id)
      // filter with req.query dates
      let filtLog = user.log
      lowDateLim != 'Invalid Date' && (filtLog = filtLog.filter(log => new Date(log.date) >= lowDateLim))
      highDateLim != 'Invalid Date' && (filtLog = filtLog.filter(log => new Date(log.date) <= highDateLim))
      // use req.query limit and construct log obj excluding the '_id' key
      filtLog = filtLog.slice(0, limit)
      for (let i=0; i < filtLog.length; i++) {
         filtLog[i] = {
            "description": user.log[i].description,
            "duration": user.log[i].duration,
            "date": user.log[i].date
         }
      }
      res.json({
         username: user.username,
         count: user.log.length,
         _id,
         log: filtLog
      })
   } catch(error) {
      return next(error)
   }
})
   
// POST: save user's new exercise at '/api/users/:_id/exercises'
router.post('/api/users/:_id/exercises', async(req, res, next) => {
   try {
      const { _id } = req.params
      let { description, duration, date } = req.body
      duration = parseInt(duration)
      date = new Date(date).toDateString() 
      date === 'Invalid Date' && (date = new Date().toDateString()) // handle Invalid Date case
      const user = await userData.findById(_id)
      user.log.push({
         description,
         duration,
         date
      })
      await user.save()
      res.json({
         username: user.username,
         description,
         duration,
         date,
         _id: user._id
      })
   } catch (error) {
      return next(error)
   }
})

// ERRORS HANDLERS (see https://zellwk.com/blog/express-errors/ ):
// endpoint not found (404)
router.use((req, res, next) => {
   next(createError(404))
})
// all other errors
router.use((error, req, res, next) => {
   res.status(error.status || 500)
   res.json({
      status: error.status,
      message: error.message,
      stack: error.stack
   })
})

module.exports = router