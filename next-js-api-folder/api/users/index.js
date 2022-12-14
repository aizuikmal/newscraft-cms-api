import axios from 'axios'
require('dotenv').config()

export default async (req, res) => {
  try {
    const users = await axios.post(process.env.API_SERVER, {
      key: 'xxxx0987',
      type: 'find',
      collection: 'users',
      limit: 1000,
      find: {}
    })
    res.status(200).json(users.data)
  } catch (error) {
    res.status(500).json(error)
  }
}
