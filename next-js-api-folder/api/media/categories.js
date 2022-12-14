import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const active_pub = req.cookies['_nc_active_publisher']

  const find = { status: 1, publisher_id: active_pub }

  const ret = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    db: 'assets',
    collection: 'category',
    find,
    sort: { fav: -1, name: 1 }
  })

  res.json({ data: ret.data })
}
