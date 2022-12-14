import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  
  const { term, type, publisher_id, property_id } = req.body

  const find = {
    term,
    publisher_id,
    property_id
  }

  const result = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'updateOne',
    collection: type == 'author' ? 'author' : 'tags',
    find: find,
    upsert: false,
    payload: { deleted: true }
  })
  res.json({ status:'ko', data: result.data.data })

}
