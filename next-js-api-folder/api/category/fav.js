import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { status, id } = req.body

  const response = await axios.post(API_SERVER, {
    key: process.env.API_KEY,
    type: 'updateOne',
    collection: 'categories',
    payload: { fav: status },
    find: { id }
  })
  res.send(response.data)

}
