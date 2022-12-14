import axios from 'axios'

require('dotenv').config()

export default async (req, res) => {
  try {
    const ret = await axios.post(process.env.API_SERVER, {
      key: process.env.API_KEY,
      type: 'find',
      collection: 'properties',
      find: req.body
    })
    res.status(200).json(ret.data)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
