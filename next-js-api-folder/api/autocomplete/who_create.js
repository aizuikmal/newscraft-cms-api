import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

  const { term, type, publisher_id, property_id } = req.body

  const find = {
    namespace: 'tags',
    publisher_id,
    property_id,
    term
  }

  const result = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    db: 'autocomplete',
    collection: 'actions',
    find: find
  })

  res.json({ status:'ok', data: result.data.data[0] })

}
