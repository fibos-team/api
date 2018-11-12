/*
 * @Author: PaddingMe (BP:liuqiangdong)
 * @Date: 2018-10-21 16:55:25
 * @Last Modified by: PaddingMe
 * @Last Modified time: 2018-11-12 21:06:09
 */

const assert = require('assert-plus')
const restify = require('restify')
const bunyan = require('bunyan')
const { getRewards } = require('../controllers/rewards')
const { getBackups, putBackups } = require('../controllers/backups')
/**
 * Returns a server with all routes defined on it
 */
function createServer (options) {
  assert.object(options, 'options')
  assert.object(options.log, 'options.log')

  const server = restify.createServer({
    log: options.log,
    name: 'fibos monitor api',
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

  server.use((req, res, next) => {
    res.removeHeader('Server')
    next()
  })

  server.use(restify.plugins.acceptParser(server.acceptable))
  server.use(restify.plugins.dateParser())
  server.use(restify.plugins.authorizationParser())
  server.use(restify.plugins.queryParser())
  server.use(restify.plugins.gzipResponse())
  server.use(restify.plugins.bodyParser())

  server.get('/api/rewards', getRewards)
  server.head('/api/rewards', getRewards)

  server.get('/api/backups', getBackups)
  server.head('/api/backups', getBackups)

  server.put('/api/backups', putBackups)

  server.get('/', (req, res, next) => {
    let routes = [
      'GET  /',
      'GET  /api/rewards',
      'GET  /api/backups',
      'POST /v1/chain/get_info',
      'POST /v1/chain/get_block',
      'POST /v1/chain/get_block_header_state',
      'POST /v1/chain/get_account',
      'POST /v1/chain/get_code',
      'POST /v1/chain/get_raw_code_and_abi',
      'POST /v1/chain/get_table_rows',
      'POST /v1/chain/get_currency_balance',
      'POST /v1/chain/abi_json_to_bin',
      'POST /v1/chain/abi_bin_to_json',
      'POST /v1/chain/get_required_keys',
      'POST get_currency_stats',
      'POST /v1/chain/get_producers',
      'POST /v1/chain/push_block',
      'POST /v1/chain/push_transaction',
      'POST /v1/chain/push_transactions'
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
