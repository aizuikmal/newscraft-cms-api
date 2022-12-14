import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { alphabet, publisher_id, property_id } = req.body

  const find = {
    term: { $regex: `^${alphabet}`, $options: 'i' },
    publisher_id,
    property_id
  }

  const result = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: 'tags',
    find: find,
    limit: 100,
    sort: { term: 1 }
  })
  res.send({ data: result.data.data })
}
