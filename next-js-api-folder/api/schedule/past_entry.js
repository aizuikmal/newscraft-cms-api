import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const publisher_id = req.cookies['_nc_active_publisher']
  const property_id = req.cookies['_nc_active_property']

  const find = { status: 1, date_schedule: { $nin: [null, ''] }, publisher_id: publisher_id, property_id: property_id }

  const ret = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    find,
    collection: 'entry',
    sort: { date_pub: -1 },
    limit: 10
  })

  res.json({ data: ret.data.data })
}
