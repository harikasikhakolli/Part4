/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken')
const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:  ', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  const token = authorization && authorization.toLowerCase().startsWith('bearer ')
    ? authorization.slice(7)
    : null

  request.token = token

  next()
}

const userExtractor = async (request, response, next) => {
  const { token } = request

  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken) return response.status(403).json({ error: 'missing or invalid token' })

  request.user = decodedToken

  next()
}

const unkownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unkown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' })
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unkownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}
