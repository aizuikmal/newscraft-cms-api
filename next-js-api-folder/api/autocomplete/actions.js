import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

  const { alphabet, type, publisher_id, property_id } = req.body

  const find = {
    namespace: 'tags',
    publisher_id,
    property_id,
    isNew: true
  }

  const result = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    db: 'autocomplete',
    collection: 'actions',
    find: find,
    limit: 20,
    sort: { date_mod: -1 }
  })
  res.json({ status:'ok', data: result.data.data })

}
