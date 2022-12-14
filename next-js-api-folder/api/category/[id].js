import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { id } = req.query
  const { publisher_id, property_id } = req.body

  try {
    const response = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'categories',
      find: { id: id, publisher_id: publisher_id, property_id: property_id }
    })
    res.send(response.data)
  } catch (error) {
    console.log(err)
    res.status(500).json({ status: 'An error has occured' })
  }
}
