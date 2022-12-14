import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { alphabet, publisher_id, property_id } = req.body

  const find = {
    name: { $regex: `^${alphabet}`, $options: 'i' },
    publisher_id,
    property_id
  }

  const result = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: 'authors',
    find: find,
    limit: 100,
    sort: { name: 1 }
  })
  if (result.data.data) {
    const resWithImage = await Promise.all(result?.data?.data.map(async author => {
      const authorRes = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'findOne',
        collection: 'author_meta',
        sort: { name: 1 },
        limit: 10000,
        find: { author_id: author.id }
      })
      return { ...author, meta: authorRes.data.data }
      // return { ...author }
    }))
    res.send({ status: 'ok', data: resWithImage })
  } else {
    res.send({ status: 'ok', data: result.data.data })
  }
}
