/*
 * @Author: PaddingMe (BP:liuqiangdong)
 * @Date: 2018-10-21 17:07:41
 * @Last Modified by: PaddingMe
 * @Last Modified time: 2018-10-21 21:39:24
 */

const MAX_LIMIT = 30
const pool = require('../utils/database')

const getRewards = async (req, res, next) => {
  let page = req.query.page > 0 ? req.query.page : 1
  let bp = req.query.bp
  let queryLimit = req.query.limit || MAX_LIMIT
  let limit = queryLimit > MAX_LIMIT ? MAX_LIMIT : queryLimit
  let isClaimRewards = req.query.claimrewards
  let offset = (page - 1) * limit

  // 只打印 bay & vpay
  let sql =
    `SELECT
      rewards.owner,
      rewards.transaction_id,
      rewards.created_at,
      rewards.name,
      rewards.data,
      rewards.type,
      rewards.quantity
    FROM
      rewards
    WHERE
      rewards.name = 'transfer' LIMIT ${limit} OFFSET ${offset};`

  // 打印 bpay vpay claimrewards 过滤 bp
  if (bp && isClaimRewards) {
    sql =
      `SELECT
        rewards.owner,
        rewards.transaction_id,
        rewards.created_at,
        rewards.name,
        rewards.data,
        rewards.type,
        rewards.quantity
      FROM
        rewards
      WHERE
        rewards.owner='${bp}' LIMIT ${limit} OFFSET ${offset};`
  }

  // 打印 bpay vpay  过滤 bp
  if (bp && !isClaimRewards) {
    sql =
      `SELECT
      rewards.owner,
      rewards.transaction_id,
      rewards.created_at,
      rewards.name,
      rewards.data,
      rewards.type,
      rewards.quantity
      FROM
        rewards
      WHERE
        rewards.name='transfer' AND rewards.owner='${bp}' LIMIT ${limit} OFFSET ${offset};`
  }

  // 打印 bpay vpay claimrewards
  if (!bp && isClaimRewards) {
    sql =
      `SELECT
      rewards.owner,
      rewards.transaction_id,
      rewards.created_at,
      rewards.name,
      rewards.data,
      rewards.type,
      rewards.quantity
      FROM
        rewards
      LIMIT ${limit} OFFSET ${offset};`
  }

  try {
    var result = await pool.query(sql)
    res.send(200, result)
  } catch (err) {
    console.error(err)
    res.send(500, {
      error: 'some error'
    })
  }
  next()
}

module.exports = getRewards
