/*
 * @Author: PaddingMe (BP:liuqiangdong)
 * @Date: 2018-11-12 20:07:33
 * @Last Modified by: PaddingMe
 * @Last Modified time: 2018-11-13 23:54:57
 */

const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const filesize = require('filesize')
const ONE_GIGA = 1024 * 1024 * 1024

AWS.config.update({
  region: process.env.S3_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACESS_KEY
})

const s3 = new AWS.S3({
  region: process.env.S3_REGION,
  Bucket: process.env.S3_BUCKET
})

function getS3ObjectHead (filename) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: filename
  }
  return s3.headObject(params).promise()
}

// recursive function to list s3 objects
async function s3ListObjects (params, s3DataContents, includeHead) {
  try {
    const data = await s3.listObjects(params).promise()
    let contents = data.Contents
    if (includeHead) {
      for (let i = 0; i < contents.length; i++) {
        let element = contents[i]
        const fileObject = await getS3ObjectHead(element.Key)
        element.head = fileObject
      }
    }

    s3DataContents = s3DataContents.concat(contents)
    if (data.IsTruncated) {
      // Set Marker to last returned key
      params.Marker = contents[contents.length - 1].Key
      await s3ListObjects(params, s3DataContents)
    } else {
      return s3DataContents
    }
  } catch (err) {
    console.error(err)
  }
}

let s3DataContents = []

exports.putBackups = async (req, res, next) => {
  try {
    const includeHead = true
    const data = await s3ListObjects({
      Bucket: process.env.S3_BUCKET
    }, s3DataContents, includeHead)

    let dataJson = data
      .filter(item => item.Size > ONE_GIGA)
      .map(item => {
        return {
          name: item.Key,
          s3url: `${process.env.S3_URL_PREFIX}${item.Key}`,
          qingUrl: `${process.env.QING_URL_PREFIX}${item.Key}`,
          size: filesize(item.Size),
          md5chksum: item.head && item.head.Metadata && item.head.Metadata.md5chksum,
          updated: item.LastModified
        }
      })

    // TODO  should saved in database
    return fs.writeFile(path.resolve(__dirname, './backups.json'), JSON.stringify(dataJson), 'utf8',
      (err) => {
        if (err) next(err)
        res.send(200, dataJson)
        next()
      })
  } catch (err) {
    console.error(err)
    res.send(500, { error: err })
    next()
  }
}

exports.getBackups = (req, res, next) => {
  // TODO  should get in database
  return fs.readFile(path.resolve(__dirname, './backups.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      next(err)
    }
    res.send(200, JSON.parse(data))
    next()
  })
}
