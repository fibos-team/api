/*
 * @Author: PaddingMe (BP:liuqiangdong)
 * @Date: 2018-10-21 16:51:36
 * @Last Modified by: PaddingMe
 * @Last Modified time: 2018-10-21 21:26:15
 */

const mysql = require('mysql')
const util = require('util')
const dotenv = require('dotenv')
dotenv.load({ path: '.env' })

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
  }
  if (connection) connection.release()
  return false
})
pool.query = util.promisify(pool.query)

module.exports = pool
