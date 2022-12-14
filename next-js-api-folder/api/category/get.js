import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { publisher_id, property_id } = req.body
  if (!publisher_id || !property_id) {
    res.json({ status: 'ko' })
    return
  }
  const response = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: 'categories',
    find: { publisher_id, property_id }
  })
  res.json({ status: 'ok', data: response.data.data })
}
