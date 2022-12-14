import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  
  const { keyword, type, publisher_id, property_id } = req.body

  const find = {
    term: { $regex: `^${keyword}`, $options: 'i' },
    publisher_id,
    property_id
  }

  const result = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: type == 'author' ? 'author' : 'tags',
    find: find,
    sort: { term: 1 }
  })
  res.send({ data: result.data.data })

}
