/*
 * @Author: PaddingMe (BP:liuqiangdong)
 * @Date: 2018-10-21 16:06:05
 * @Last Modified by: PaddingMe
 * @Last Modified time: 2018-10-21 18:21:20
 */

const LOG = require('./utils/log')
const parseOptions = require('./utils/parseOptions')
const api = require('./api')

const main = () => {
  let options = parseOptions()
  LOG.debug(options, 'command line arguments parsed')

  let server = api.createServer({
    log: LOG
  })

  server.listen(options.port || 8080, function onListening () {
    LOG.info('listening at %s', server.url)
  })
}

module.exports = main()
