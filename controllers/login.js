/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { password } = request.body
  const { username } = request.body

  const userInDb = await User.findOne({ username })

  const passwordIsCorrect = userInDb === null
    ? false
    : await bcrypt.compare(password, userInDb.passwordHash)

  if (!(userInDb && passwordIsCorrect)) return response.status(401).json({ error: 'username or password invalid' })

  const token = jwt.sign({ username: userInDb.username, id: userInDb._id }, process.env.SECRET)

  return response.status(200).send({ token, username, name: userInDb.name })
})

module.exports = loginRouter
