/* eslint-disable no-underscore-dangle */
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const {userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { token } = request

  const userFromRequest = request.user
  console.log(userFromRequest)
  if (!token || !userFromRequest) return response.status(401).json({ error: 'token missing or invalid' })
  const verifiedUserId = userFromRequest.id

  const blog = request.body
  blog.likes = blog.likes || 0
  const user = await User.findById(verifiedUserId)

  blog.user = user._id

  if (!blog.title && !blog.url) return response.status(400).json({ error: 'url and title missing from request' })

  const blogToSave = new Blog(blog)

  const savedBlog = await blogToSave.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  return response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const userFromRequest = request.user
  const { id } = request.params

  const blog = await Blog.findById(id)

  if (blog.user.toString() === userFromRequest.id.toString()) {
    await Blog.findByIdAndRemove(id)
    return response.status(204).end()
  }
  return response.status(403).send({ error: 'you are not the owner of this blog' })
})

blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params
  const editedBlog = {
    likes: request.body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, editedBlog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter
