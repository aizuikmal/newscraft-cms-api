import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const publisher_id = req.cookies['_nc_active_publisher']
  const property_id = req.cookies['_nc_active_property']

  const { id } = req.query

  console.log('req.query', req.query)

  if (!id || id.length <= 5) {
    res.json({ status: 'ko', data: [] })
    return false
  }

  let find = {}
  find = {
    id,
    status: 1,
    publisher_id: publisher_id,
    property_id: property_id
  }

  if (req.method === 'POST') {
    const payload = req.body
    delete payload._id
    axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'updateOne',
      collection: 'authors',
      upsert: false,
      payload,
      find: find
    })
    res.json({ status: 'ok' })
  } else if (req.method === 'DELETE'){
    axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'updateOne',
      collection: 'authors',
      upsert: false,
      payload: { status: 0 },
      find: find
    })
    res.json({ status: 'ok' })
  } else {
    const response = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'authors',
      find: find
    })
    if (response.data.data) {
      const authorRes = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'findOne',
        collection: 'author_meta',
        sort: { name: 1 },
        limit: 10000,
        find: { author_id: response.data.data.id }
      })
      res.json({ status: 'ok', data: { ...response.data.data, meta: authorRes.data.data } })
    } else {
      res.json({ status: 'ok', data: response.data.data })
    }
    // res.set({ 'content-type': 'application/json; charset=utf-8' })
    // res.json({ status: 'ok', data: response.data.data })
  }
}
