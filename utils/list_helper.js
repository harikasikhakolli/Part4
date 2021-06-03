const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0)

const favouriteBlog = (blogs) => {
  const favBlog = blogs.reduce((prev, current) => {
    if (current.likes > prev.likes) return current
    return prev
  })

  return favBlog
}

module.exports = {
  totalLikes,
  favouriteBlog
}
