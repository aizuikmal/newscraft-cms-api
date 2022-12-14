const router = require('express').Router()
const MongoClient = require('mongodb').MongoClient
const fs = require('fs')

const sizeOf = require('image-size')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

const md5 = require('md5')

const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()

let agenda = require('../scheduler/agenda')
require('dotenv').config()

const _ = require('lodash')

global.AWS = require('aws-sdk')

const CHECK_IP_ADDRESS = false

const ip_address_allowed = [
  'xxxxxxxxx', // localhost
  '127.0.0.1', // localhost
]

MongoClient.connect(
  process.env.DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) return console.log(err)
    db = client.db(process.env.DB_NAME_ENTRY)
    console.log('DB_NAME_ENTRY connected')
  }
)

MongoClient.connect(
  process.env.DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) return console.log(err)
    db_assets = client.db(process.env.DB_NAME_ASSETS)
    console.log('DB_NAME_ASSETS connected')
  }
)

MongoClient.connect(
  process.env.DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) return console.log(err)
    db_autocomplete = client.db(process.env.DB_NAME_AUTOCOMPLETE)
    console.log('DB_NAME_AUTOCOMPLETE connected')
  }
)

MongoClient.connect(
  process.env.DB_URL_INGEST,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) return console.log(err)
    db_ingests = client.db(process.env.DB_NAME_INGEST)
    console.log('DB_NAME_INGEST connected')
  }
)

MongoClient.connect(
  process.env.DB_URL_SCHEDULING,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) return console.log(err)
    db_scheduling = client.db(process.env.DB_NAME_ENTRY)
    console.log('DB_NAME_SCHEDULING connected')
  }
)

router.post('/graph_analytics/:type/:publisher_lang', graph_analytics)
router.post('/scheduling/publish_entry', publish_entry)
router.post('/scheduling/publish_series', publish_series)
router.post('/scheduling/delete/:id', delete_entry)
router.post('/scheduling/articleExpiry', articleExpiry)
router.post('/redis', redis_post)
router.post('/s3', s3_post)
router.post('/db', db_post)
router.post('/upload', multipartMiddleware, upload_file_public)
router.post('/searchAuthor', search_authors)
router.post('/user/permission', user_permission)

async function user_permission (req, res) {
  const { user_id, super_admin = 0 } = req.body

  try {
    const ret = await db
      .collection('permissions')
      .find({ user_id, status: 1 })
      .project({ _id: 0 })
      .toArray()
    const permissions = ret
    const permission_data = await getPermissions(permissions, super_admin)
    res.status(200).json(permission_data)
  } catch (error) {
    res.status(500).json(error)
  }
}

const getPermissions = async (permissions, super_admin) => {
  if (!permissions.length) {
    return []
  }
  let payload = {}
  payload.publishers = await getPublishers(permissions, super_admin)
  payload.properties = await getProperties(permissions, super_admin)
  return payload
}

const getPublishers = async (permissions, super_admin) => {
  let payload = []
  if (!super_admin) {
    payload = await Promise.all(
      permissions.map(async perms => {
        const publisher = await db
          .collection('publishers')
          .findOne({ id: perms.pub_id, status: 1 })
        return publisher
      })
    )
    payload = [...new Map(payload.map(item => [item['id'], item])).values()]
  } else {
    const publishers = await db
      .collection('publishers')
      .find({ status: 1 })
      .project({ _id: 0 })
      .toArray()
    payload = publishers
  }
  return payload
}

const getProperties = async (permissions, super_admin) => {
  let payload = []
  if (!super_admin) {
    payload = await Promise.all(
      permissions.map(async perms => {
        const property = await db
          .collection('properties')
          .findOne({ id: perms.prop_id, pub_id: perms.pub_id })
        return property
      })
    )
  } else {
    const properties = await db
      .collection('properties')
      .find({})
      .project({ _id: 0 })
      .sort({ lang: 1 })
      .toArray()
    payload = properties
  }
  return payload
}

async function search_authors (req, res) {
  try {
    const { authorName, property_id, publisher_id, status } = req.body
    if (!authorName) return res.status(400).send('authorName is required')
    const authors = await db
      .collection('authors')
      .aggregate([
        {
          $search: {
            index: 'author_name',
            text: {
              query: authorName,
              path: {
                wildcard: '*'
              }
            }
          }
        },
        {
          $match: {
            publisher_id: publisher_id,
            property_id: property_id,
            status: status
          }
        }
      ])
      .toArray()
    console.log(authors, 'S')
    res.json({
      authors
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error)
  }
}

async function graph_analytics (req, res) {
  const { type, publisher_lang } = req.params
  const path = `/var/www/html/xxxxxxxxx/graph_analytics/${type ||
    'stories_published'}`
  !publisher_lang && res.status(400).send('publisher is required')

  try {
    fs.readFile(`${path}/${publisher_lang}.json`, (err, data) => {
      if (err) throw err
      res.send(JSON.parse(data))
    })
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

async function delete_entry (req, res) {
  const { id } = req.params
  if (!id) {
    res.status(400).send('id is required')
    return
  }

  const find = {
    id: id
  }
  const findToDelete = {
    'data.id': id
  }

  try {
    const entry = await db
      .collection('entry')
      .updateOne(find, { $set: { status: 2 } })

    const response = await db_scheduling
      .collection('scheduling')
      .deleteOne(findToDelete)

    res.send(response)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

async function publish_entry (req, res) {
  const { id, date_pub } = req.body

  const jobCount = await db_scheduling.collection('scheduling').count({
    name: 'publish entry',
    'data.id': id
  })

  if (jobCount > 0) {
    const response = await db_scheduling
      .collection('scheduling')
      .findOneAndUpdate(
        {
          name: 'publish entry',
          'data.id': id
        },
        {
          $set: {
            'data.pub_date': new Date(date_pub),
            nextRunAt: new Date(date_pub)
          }
        }
      )
    console.log('update publish_entry', req.body)
    res.send(response)
  } else {
    const response = await agenda.schedule(date_pub, 'publish entry', {
      id: id,
      pub_date: date_pub
    })
    console.log('register publish_entry', req.body)
    res.send(response)
  }
}

async function articleExpiry (req, res) {
  const { id, date_expiry } = req.body

  const jobCount = await db_scheduling.collection('scheduling').count({
    name: 'article expiry',
    'data.id': id
  })

  if (jobCount > 0) {
    const response = await db_scheduling
      .collection('scheduling')
      .findOneAndUpdate(
        {
          name: 'article expiry',
          'data.id': id
        },
        {
          $set: {
            'data.date_expiry': new Date(date_expiry),
            nextRunAt: new Date(date_expiry)
          }
        }
      )
    console.log('update article expiry', req.body)
    res.send(response)
  } else {
    const response = await agenda.schedule(date_expiry, 'article expiry', {
      id: id,
      date_expiry: date_expiry
    })
    console.log('register article expiry', req.body)
    res.send(response)
  }
}

async function publish_series (req, res) {
  const { id, feed_id, feed_pos, date_mod } = req.body
  if (feed_id) {
    const jobCount = await db_scheduling.collection('scheduling').count({
      name: 'publish series',
      'data.id': id
    })

    if (jobCount > 0) {
      const response = await db_scheduling
        .collection('scheduling')
        .findOneAndUpdate(
          {
            name: 'publish series',
            'data.id': id
          },
          {
            $set: {
              'data.feed_id': feed_id,
              'data.feed_pos': feed_pos,
              'data.date_mod': new Date(date_mod),
              nextRunAt: new Date(date_mod)
            }
          }
        )
      console.log('update publish_series', req.body)
      res.send(response)
    } else {
      const response = await agenda.schedule(date_mod, 'publish series', {
        id: id,
        feed_id: feed_id,
        feed_pos: feed_pos,
        date_mod: date_mod
      })
      console.log('register publish_series', req.body)
      res.send(response)
    }
  } else {
    res.send('feed_id is required')
  }
}

async function upload_file_public (req, res) {
  dayjs.tz.setDefault('Asia/Kuala_Lumpur')

  const BUCKET = 'xxxxxxxxx'

  console.log('s3_post() req.files', req.files)
  console.log('s3_post() req.body', req.body)

  if (!_.has(req.body, 'payload')) {
    res.status(404).json({ status: 'FAILED', message: 'missing payload' })
    return
  }

  const s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    Bucket: BUCKET
  })

  const { key, pub_id } = JSON.parse(req.body.payload)

  //this is API key, to ensure the correct hashing, not S3 key.
  if (!key) {
    res.status(404).json({ status: 'FAILED', message: 'missing key' })
    return
  }
  if (!pub_id) {
    res.status(404).json({ status: 'FAILED', message: 'missing pub_id' })
    return
  }

  //check hash-key
  if (key !== md5(pub_id)) {
    res.status(404).json({ status: 'FAILED', message: 'invalid key' })
    return
  }

  var file_ext = req.files.file.originalFilename.split('.').pop()
  if (file_ext == 'jpeg') {
    file_ext = 'jpg'
  }

  const current_ts = new Date().getTime()
  const file_id = md5(
    req.files.file.originalFilename + req.files.file.size + current_ts
  )
  const file_new_name = file_id + '.' + file_ext.toLowerCase()
  const file_name_w_folders = `publisher-${md5(pub_id)}/${dayjs().format(
    'YYYY'
  )}/${dayjs().format('MM')}/${file_new_name}`
  const file_key = `${BUCKET}/${file_name_w_folders}`

  const url = `https://xxxxxxxxx/${file_name_w_folders}`

  sizeOf(req.files.file.path, function (err, dimensions) {
    s3bucket.createBucket(function () {
      var params = {
        Bucket: BUCKET,
        Key: file_name_w_folders,
        Body: fs.createReadStream(req.files.file.path),
        CacheControl: 'no-cache',
        ContentType: 'application/octet-stream; charset=utf-8'
      }

      var master = []

      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log('upload_file_public()')
          console.log(err)
          res.json({ status: 'FAILED', message: err, data: false })
          return
        } else {
          var Location = data.Location
          var idkey = data.key

          master.push(Location)
          master.push(idkey)

          // var req_params = {
          //   Bucket: bucket,
          //   Key: data.key
          // }

          // s3bucket.getObject(req_params, function (err, objects) {

          //   if (err) {
          //     console.log('upload_file_public()')
          //     console.log(err);
          //     callback(false);
          //   } else {

          //     var ContentLength = objects.ContentLength // file size
          //     var Metadata = objects.Metadata
          //     // var keyword = Metadata.keyword
          //     // var name = Metadata.name
          //     // var description = Metadata.description

          //   }

          // })

          dayjs.tz.setDefault()
          res.json({
            status: 'SUCCESS',
            data: { url, width: dimensions.width, height: dimensions.height }
          })

          //delete uploaded file
          // fs.unlink(req.files.file.path)
        }
      })
    })
  })

  // dayjs.tz.setDefault()
  // res.json({ status: 'FAILED', data:false })
}

async function redis_post (req, res) {
  if (!check_ip(req)) {
    console.error(
      'IP NOT ALLOWED',
      req.headers['x-forwarded-for'] || req.socket.remoteAddress
    )
    res.send('not allowed')
    return
  }

  console.log('redis_post()')

  res.send('redis_post ok')
}

async function s3_post (req, res) {
  if (!check_ip(req)) {
    console.error(
      'IP NOT ALLOWED',
      req.headers['x-forwarded-for'] || req.socket.remoteAddress
    )
    res.send('not allowed')
    return
  }

  console.log('s3_post()', req.body)

  const { bucket, key, content, method } = req.body

  if (!bucket) {
    res.status(404).json({ status: 'FAILED', message: 'missing bucket' })
    return
  }
  if (!key) {
    res.status(404).json({ status: 'FAILED', message: 'missing key' })
    return
  }
  if (!method) {
    res.status(404).json({ status: 'FAILED', message: 'missing method' })
    return
  }

  const s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    Bucket: bucket
  })

  if (method.toLowerCase() == 'post') {
    if (!content) {
      res.status(404).json({ status: 'FAILED', message: 'missing content' })
      return
    }

    s3bucket.createBucket(function () {
      var params = {
        Bucket: bucket,
        Key: key,
        Body: content,
        CacheControl: 'no-cache',
        ContentType: 'text/plain'
      }

      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log('module_s3.js')
          console.log(err)
        }
      })
    })

    res.send('ok')
  }

  if (method.toLowerCase() == 'get') {
    var params = {
      Bucket: bucket,
      Key: key
    }

    s3bucket.getObject(params, function (err, data) {
      if (err) {
        console.log(err)
        // callback('')
        res.send('')
        return
      }

      //Convert Body from a Buffer to a String
      let objectData = data.Body.toString('utf-8')

      res.send(objectData)
    })
  }
}

async function db_post (req, res) {
  //check ip address

  if (!check_ip(req)) {
    console.error(
      'IP NOT ALLOWED',
      req.headers['x-forwarded-for'] || req.socket.remoteAddress
    )
    res.send('not allowed')
    return
  }

  const {
    key,
    type,
    collection,
    find,
    payload,
    upsert,
    limit,
    skip,
    sort,
    projection = {},
    unset = false
  } = req.body

  let { db: db_requested } = req.body

  const server_key = 'xxxxxxxxx'

  console.log('REQ BODY: ', JSON.stringify(req.body))

  if (!key && key !== server_key) {
    res.status(404).json({ status: 'FAILED', message: 'missing key' })
    return
  }
  if (!type) {
    res.status(404).json({ status: 'FAILED', message: 'missing type' })
    return
  }
  if (!collection) {
    res.status(404).json({ status: 'FAILED', message: 'missing collection' })
    return
  }

  if (type === 'findOne') {
    if (!find) {
      res.status(404).json({ status: 'FAILED', message: 'missing find' })
      return
    }

    try {
      if (db_requested == 'assets') {
        const ret = await db_assets.collection(collection).findOne(find)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (collection == 'author' || collection == 'tags') {
        const ret = await db_autocomplete.collection(collection).findOne(find)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (db_requested === 'ingests') {
        const ret = await db_ingests.collection(collection).findOne(find)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else {
        const ret = await db.collection(collection).findOne(find)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      }
    } catch (error) {
      res.status(400).json({ status: 'FAILED', data: error })
    }
  }

  if (type === 'find') {
    if (!find) {
      res.status(404).json({ status: 'FAILED', message: 'missing find' })
      return
    }

    const limit_db = limit ? parseInt(limit) : 100
    const sort_db = sort ? sort : { id: 1 }
    const skip_db = Number.isInteger(skip) ? skip : 0

    try {
      if (db_requested == 'assets') {
        const ret = await db_assets
          .collection(collection)
          .find(find)
          .project(projection)
          .limit(limit_db)
          .skip(skip_db)
          .sort(sort_db)
          .toArray()
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (
        db_requested == 'autocomplete' ||
        collection == 'author' ||
        collection == 'tags'
      ) {
        console.log('===========>' + collection, JSON.stringify(find))
        const ret = await db_autocomplete
          .collection(collection)
          .find(find)
          .project(projection)
          .limit(limit_db)
          .skip(skip_db)
          .sort(sort_db)
          .toArray()
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (db_requested === 'ingests') {
        console.log('===========>' + collection, JSON.stringify(find))
        const ret = await db_ingests
          .collection(collection)
          .find(find)
          .project(projection)
          .limit(limit_db)
          .skip(skip_db)
          .sort(sort_db)
          .toArray()
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else {
        const ret = await db
          .collection(collection)
          .find(find)
          .project(projection)
          .limit(limit_db)
          .skip(skip_db)
          .sort(sort_db)
          .toArray()
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      }
    } catch (error) {
      res.status(400).json({ status: 'FAILED', data: error })
    }
  }

  if (type === 'count') {
    if (!find) {
      res.status(404).json({ status: 'FAILED', message: 'missing find' })
      return
    }

    try {
      if (db_requested == 'assets') {
        const ret = await db_assets
          .collection(collection)
          .find(find)
          .count()
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (collection == 'author' || collection == 'tags') {
        const ret = await db_autocomplete
          .collection(collection)
          .find(find)
          .count()
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (db_requested === 'ingests') {
        const ret = await db_ingests
          .collection(collection)
          .find(find)
          .count()
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else {
        const ret = await db
          .collection(collection)
          .find(find)
          .count()
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      }
    } catch (error) {
      res.status(400).json({ status: 'FAILED', data: error })
    }
  }

  if (type === 'insertOne') {
    if (!payload) {
      res.status(404).json({ status: 'FAILED', message: 'missing payload' })
      return
    }

    try {
      if (db_requested == 'assets') {
        const ret = await db_assets.collection(collection).insertOne(payload)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (
        db_requested == 'autocomplete' ||
        collection == 'author' ||
        collection == 'tags'
      ) {
        const ret = await db_autocomplete
          .collection(collection)
          .insertOne(payload)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (db_requested === 'ingests') {
        const ret = await db_ingests.collection(collection).insertOne(payload)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else {
        const ret = await db.collection(collection).insertOne(payload)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      }
    } catch (error) {
      res.status(400).json({ status: 'FAILED', data: error })
    }
  }

  if (type === 'insertMany') {
    if (!payload) {
      res.status(404).json({ status: 'FAILED', message: 'missing payload' })
      return
    }

    try {
      if (db_requested == 'assets') {
        const ret = await db_assets.collection(collection).insertMany(payload)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (
        db_requested == 'autocomplete' ||
        collection == 'author' ||
        collection == 'tags'
      ) {
        const ret = await db_autocomplete
          .collection(collection)
          .insertMany(payload)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (db_requested === 'ingests') {
        const ret = await db_ingests.collection(collection).insertMany(payload)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else {
        const ret = await db.collection(collection).insertMany(payload)
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      }
    } catch (error) {
      res.status(400).json({ status: 'FAILED', data: error })
    }
  }

  if (type === 'updateOne') {
    if (!find) {
      res.status(404).json({ status: 'FAILED', message: 'missing find' })
      return
    }

    try {
      if (db_requested == 'assets') {
        if (!payload) {
          res.status(404).json({ status: 'FAILED', message: 'missing payload' })
          return
        }
        const ret = await db_assets
          .collection(collection)
          .updateOne(
            find,
            { $set: payload },
            { upsert: upsert ? upsert : false }
          )
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else if (
        db_requested == 'autocomplete' ||
        collection == 'author' ||
        collection == 'tags'
      ) {
        if (unset) {
          const ret = await db_autocomplete
            .collection(collection)
            .updateOne(find, { $unset: unset })
          res.json({ status: 'SUCCESS', data: ret ? ret : null })
        } else {
          if (!payload) {
            res
              .status(404)
              .json({ status: 'FAILED', message: 'missing payload' })
            return
          }
          const ret = await db_autocomplete
            .collection(collection)
            .updateOne(
              find,
              { $set: payload },
              { upsert: upsert ? upsert : false }
            )
          res.json({ status: 'SUCCESS', data: ret ? ret : null })
        }
      } else if (db_requested === 'ingests') {
        const ret = await db_ingests
          .collection(collection)
          .updateOne(
            find,
            { $set: payload },
            { upsert: upsert ? upsert : false }
          )
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      } else {
        if (!payload) {
          res.status(404).json({ status: 'FAILED', message: 'missing payload' })
          return
        }
        const ret = await db
          .collection(collection)
          .updateOne(
            find,
            { $set: payload },
            { upsert: upsert ? upsert : false }
          )
        res.json({ status: 'SUCCESS', data: ret ? ret : null })
      }
    } catch (error) {
      res.status(400).json({ status: 'FAILED', data: error })
    }
  }
}

function check_ip (req) {
  if (!CHECK_IP_ADDRESS) {
    return true
  }

  const ip_client = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  if (!ip_address_allowed.includes(ip_client)) {
    return false
  } else {
    return true
  }
}

module.exports = router
