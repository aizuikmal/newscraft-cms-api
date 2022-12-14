import axios from 'axios'
require('dotenv').config()

export default async (req, res) => {
  const { payload } = req.body
  const { value, publisher_id, property_id } = payload
  try {
    const ret = await axios.post(process.env.API_SERVER, {
      key: process.env.API_KEY,
      type: 'find',
      collection: 'entry',
      limit: 100,
      find: { $text: { $search: value }, publisher_id, property_id }
    })
    res.status(200).json(ret.data)
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: 'errored', data: [], message: error.message })
  }
}
