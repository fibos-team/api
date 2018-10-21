/*
 * @Author: PaddingMe (BP:liuqiangdong)
 * @Date: 2018-10-21 16:11:04
 * @Last Modified by: PaddingMe
 * @Last Modified time: 2018-10-21 17:48:24
 */

const NAME = 'app'
const restify = require('restify')
const bunyan = require('bunyan')
const LOG = bunyan.createLogger({
  name: NAME,
  streams: [{
    level: process.env.LOG_LEVEL || 'info',
    stream: process.stderr
  },
  {
    level: 'debug',
    type: 'raw',
    stream: new restify.bunyan.RequestCaptureStream({
      level: bunyan.WARN,
      maxRecords: 100,
      maxRequestIds: 1000,
      stream: process.stderr
    })
  }],
  serializers: restify.bunyan.serializers
})

module.exports = LOG
