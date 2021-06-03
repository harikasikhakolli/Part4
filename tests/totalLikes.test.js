const listHelper = require('../utils/list_helper')
const testHelper = require('./test_helper')

describe('Total likes', () => {
  test('total likes for multiple blogs equals sum of each blog likes', () => {
    const result = listHelper.totalLikes(testHelper.initialBlogs)
    expect(result).toBe(36)
  })

  test('Total likes of one blog is likes itself', () => {
    const oneBlog = [
      {
        _id: '5a422bc61b54a676234d17fc',
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2,
        __v: 0
      }
    ]

    const result = listHelper.totalLikes(oneBlog)
    expect(result).toBe(oneBlog[0].likes)
  })
})

describe('Blog with most likes', () => {
  test('Show favourite blog with most likes', () => {
    const result = listHelper.favouriteBlog(testHelper.initialBlogs)

    expect(result).toEqual(testHelper.initialBlogs[2])
  })
})
