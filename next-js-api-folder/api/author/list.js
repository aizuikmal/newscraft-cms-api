import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const publisher_id = req.cookies['_nc_active_publisher']
  const property_id = req.cookies['_nc_active_property']

  const { alphabet } = req.query

  if (!alphabet || alphabet.length != 1) {
    res.json({ status: 'ko', data: [] })
    return false
  }

  let find = {}
  // if (alphabet && alphabet.length == 1) {
  find = {
    name: { $regex: `^${alphabet}`, $options: 'i' },
    status: 1,
    publisher_id: publisher_id,
    property_id: property_id
  }
  // } else {
  //   find = {
  //     status: 1,
  //     publisher_id: publisher_id,
  //     property_id: "57CFB13FD747D3CAA6CC815F45FCDCF405CD627A1DF51D8B9957EFA5B18B28B2"
  //   }
  // }

  const response = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: 'authors',
    sort: { name: 1 },
    limit: 10000,
    find: find
  })
  if (response.data.data) {
    const resWithImage = await Promise.all(response?.data?.data.map(async author => {
      const authorRes = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'findOne',
        collection: 'author_meta',
        sort: { name: 1 },
        find: { author_id: author.id }
      })
      return { ...author, meta: authorRes.data.data }
      // return { ...author }
    }))
    res.json({ status: 'ok', data: resWithImage })
  } else {
    res.json({ status: 'ok', data: response.data.data })
  }
}
