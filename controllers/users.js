const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const usersList = await User.find({}).populate('blogs', { title: 1, url: 1, author: 1 })

  response.status(200).json(usersList)
})

usersRouter.post('/', async (request, response) => {
  const requestUser = {
    username: request.body.username,
    name: request.body.name,
    password: request.body.password
  }

  if (!requestUser.username || !requestUser.password) {
    return response.status(400).json({ error: 'username or password is missing' })
  }

  if (requestUser.password.length < 3 || requestUser.username.length < 3) return response.status(400).json({ error: 'password and username should be atleast 3 characters.' })

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(request.body.password, saltRounds)

  const user = new User({
    username: request.body.username,
    name: request.body.name,
    passwordHash
  })
  const savedUser = await user.save()

  return response.json(savedUser)
})

module.exports = usersRouter
