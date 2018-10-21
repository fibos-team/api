/*
 * @Author: PaddingMe (BP:liuqiangdong)
 * @Date: 2018-10-21 16:14:42
 * @Last Modified by: PaddingMe
 * @Last Modified time: 2018-10-21 17:48:28
 */

/**
 * Standard POSIX getopt-style options parser.
 * 获取 shell 传入参数
 * 例如：node main.js -p 80 -vv 2>&1 | bunyan
 */

const NAME = 'app'
const path = require('path')
const getopt = require('posix-getopt')
var LOG = require('./log')
const bunyan = require('bunyan')

const parseOptions = () => {
  let option
  let opts = {}
  var parser = new getopt.BasicParser('hvd:p:u:z:', process.argv)
  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
      case 'd':
        opts.directory = path.normalize(option.optarg);
        break

      case 'h':
        usage()
        break

      case 'p':
        opts.port = parseInt(option.optarg, 10)
        break

      case 'u':
        opts.user = option.optarg
        break

      case 'v':
        // Allows us to set -vvv -> this little hackery
        // just ensures that we're never < TRACE
        LOG.level(Math.max(bunyan.TRACE, LOG.level() - 10))
        if (LOG.level() <= bunyan.DEBUG) {
          LOG = LOG.child({ src: true })
        }
        break

      case 'z':
        opts.password = option.optarg
        break

      default:
        usage('invalid option: ' + option.option)
        break
    }
  }

  return opts
}

const usage = (msg) => {
  if (msg) {
    console.error(msg)
  }
  var str = 'usage: ' + NAME + ' [-v] [-d dir] [-p port] [-u user] [-z password]'
  console.error(str)
  process.exit(msg ? 1 : 0)
}

module.exports = parseOptions
