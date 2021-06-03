const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const testHelper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

// for my internet connection
jest.setTimeout(10000)

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = testHelper.initialBlogs.map(blog => new Blog(blog))

  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('4.8 - 4.12 tests', () => {
  test('returns correct no. of blogs in json', async () => {
    const results = await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(results.body).toHaveLength(testHelper.initialBlogs.length)
  })

  test('unique id prop is id not _id', async () => {
    const results = await api.get('/api/blogs')
    expect(results.body[0].id).toBeDefined()
  })

  test('post creates new blog in db', async () => {
    const blog = {
      title: 'Hombre',
      author: 'Erico',
      url: 'www.hombreerico.com',
      likes: 42
    }

    await api.post('/api/blogs').send(blog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterPost = await testHelper.blogsInDb()
    expect(blogsAfterPost).toHaveLength(testHelper.initialBlogs.length + 1)
  })

  test('likes == 0 if likes missing', async () => {
    const blog = {
      title: 'There are no likes for this blog',
      author: 'MoocFI',
      url: 'www.moocfi.com'
    }

    const result = await api.post('/api/blogs').send(blog)

    expect(result.body.likes).toEqual(0)
  })

  test('if title AND url missing, response is 400', async () => {
    const blog = {
      author: 'Joobfi'
    }

    await api.post('/api/blogs').send(blog)
      .expect(400)

    const blogsInDb = await testHelper.blogsInDb()

    expect(blogsInDb).toHaveLength(testHelper.initialBlogs.length)
  })
})

describe('tests 4.13 - 4.14', () => {
  test('blog is deleted', async () => {
    const blogsList = await testHelper.blogsInDb()
    const idToDelete = blogsList[0].id

    await api.delete(`/api/blogs/${idToDelete}`)
      .expect(204)

    const newBlogsInDb = await testHelper.blogsInDb()
    expect(newBlogsInDb).toHaveLength(testHelper.initialBlogs.length - 1)
  })

  test('blog likes are updated', async () => {
    const blogsInDb = await testHelper.blogsInDb()

    const blogIdToEdit = blogsInDb[0].id

    const updatedBlog = await api.put(`/api/blogs/${blogIdToEdit}`).send({ likes: 69 })

    expect(updatedBlog.body.likes).toBe(69)
  })
})

describe('with a single user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const saltRounds = 10
    const passwordHash = await bcrypt.hash('secret', saltRounds)

    const initialUser = new User({
      username: 'iFirst',
      name: 'First Person',
      passwordHash
    })

    await initialUser.save()
  })

  test('user is added to db with valid request', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const userToAdd = {
      username: 'Eric',
      name: 'Hombre',
      password: 'JojoRabbit'
    }

    await api
      .post('/api/users')
      .send(userToAdd)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()

    expect(usersAtEnd.map(user => user.username)).toContain(userToAdd.username)
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  })

  test('user without username or password is not added to db', async () => {
    const user = {
      name: 'Eric'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })

  test('both password and username should be 3 characters', async () => {
    const usersAtStart = await testHelper.usersInDb()

    const user = {
      username: 'jojo',
      name: 'Johnny',
      password: 'we'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    user.password = 'weak'
    user.username = 'jo'

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()

    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('username must be unique', async () => {
    const dupUser = {
      username: 'iFirst',
      name: 'Duplicator',
      password: 'str'
    }

    await api
      .post('/api/users')
      .send(dupUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
