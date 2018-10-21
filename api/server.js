/*
 * @Author: PaddingMe (BP:liuqiangdong)
 * @Date: 2018-10-21 16:55:25
 * @Last Modified by: PaddingMe
 * @Last Modified time: 2018-10-21 18:02:15
 */

const assert = require('assert-plus')
const restify = require('restify')
const getRewards = require('../services/getRewards')
var bunyan = require('bunyan')

/**
 * Returns a server with all routes defined on it
 */
function createServer (options) {
  assert.object(options, 'options')
  assert.object(options.log, 'options.log')

  const server = restify.createServer({
    log: options.log,
    name: 'liuqiangdong API',
    version: '1.0.0' // 版本暂定都默认为 1.0.0
  })

  // 确保在上传时不丢数据
  server.pre(restify.pre.pause())

  // 过滤路径中重复的/ 如`/rewards//////1//`
  server.pre(restify.pre.sanitizePath())

  // 处理各种user agents (如curl)
  server.pre(restify.pre.userAgentConnection())

  // log = bunyan
  server.use(restify.plugins.requestLogger())

  // 允许每个IP 每秒 5个请求，最多10个
  server.use(
    restify.plugins.throttle({
      burst: 10,
      rate: 5,
      ip: true
    })
  )

  server.use(restify.plugins.acceptParser(server.acceptable))
  server.use(restify.plugins.dateParser())
  server.use(restify.plugins.authorizationParser())
  server.use(restify.plugins.queryParser())
  server.use(restify.plugins.gzipResponse())
  server.use(restify.plugins.bodyParser())

  server.get('/api/rewards', getRewards)
  server.head('/api/rewards', getRewards)

  server.get('/', (req, res, next) => {
    let routes = [
      'GET     /',
      'GET    /api/rewards'
    ]
    res.send(200, routes)
    next()
  })

  server.on(
    'after',
    restify.plugins.auditLogger({
      body: true,
      event: 'after',
      log: bunyan.createLogger({
        level: 'info',
        name: 'audit',
        stream: process.stdout
      })
    })
  )
  return server
}

module.exports = {
  createServer: createServer
}
