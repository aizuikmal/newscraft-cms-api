import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const publisher_id = req.cookies['_nc_active_publisher']
  const property_id = req.cookies['_nc_active_property']

  let find = {}
  find = {
    "id": { "$in": [ null, "" ] },
    status: 1,
    // publisher_id: publisher_id,
    // property_id: property_id
  }

  const response = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: 'authors',
    sort: { name: 1 },
    limit: 100000,
    find: find
  })

  console.log(response.data.data)

  response.data.data.map(item => {
    if (item.id) {
      // console.log('not update',item.name)
    } else {
      const hash = md5(item.name + item.publisher_id + item.property_id + 'some salt on wound')

      
      const find_update = { name: item.name, publisher_id: item.publisher_id, property_id: item.property_id }

      console.log(hash,find_update)

      axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'updateOne',
        collection: 'authors',
        find: find_update,
        upsert: false,
        payload: { id: hash }
      })
    }
  })

  res.json({ status: 'ok' })
}
