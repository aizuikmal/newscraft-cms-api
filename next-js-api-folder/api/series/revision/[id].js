import axios from 'axios'
import dayjs from 'dayjs'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { id } = req.query
  try {
    const response = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'find',
      collection: 'feed_revisions',
      find: { feed_id: id },
      sort: { createdAt: -1 },
      limit: 30
    })
    res.send(response.data)
  } catch (error) {
    console.log('error 1', error)
    res.status(500).json({ status: 'An error has occured' })
  }
}
