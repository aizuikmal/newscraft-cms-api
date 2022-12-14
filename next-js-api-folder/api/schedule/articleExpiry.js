import axios from 'axios'

require('dotenv').config()
const API_ENDPOINT = process.env.API_ENDPOINT

export default async (req, res) => {
  try {
    const { id, date_expiry } = req.body
    const ret = await axios.post(`${API_ENDPOINT}/scheduling/articleExpiry`, { id, date_expiry })
    res.status(200).json(ret.data)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
