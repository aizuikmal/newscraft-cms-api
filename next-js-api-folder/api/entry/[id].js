import axios from 'axios'
require('dotenv').config()

export default async (req, res) => {
  const { id } = req.query
  try {
    const ret = await axios.post(process.env.API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'entry',
      find: { id: id },
      projection: {
        id: 1,
        title: 1,
        cat_str: 1
      }
    })
    res.status(200).json(ret.data)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
