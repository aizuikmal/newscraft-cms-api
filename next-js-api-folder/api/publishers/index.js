import axios from 'axios'

require('dotenv').config()

export default async (req, res) => {
  const { type } = req.query
  try {
    const ret = await axios.post(process.env.API_SERVER, {
      key: 'xxxx0987',
      type: type ? type : 'find',
      collection: 'publishers',
      find: req.body
    })
    res.status(200).json(ret.data)
  } catch (error) {
    res.status(500).json(error)
  }
}
