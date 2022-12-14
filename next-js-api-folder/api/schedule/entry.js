import axios from 'axios'

require('dotenv').config()
const API_ENDPOINT = process.env.API_ENDPOINT

export default async (req, res) => {
  try {
    const ret = await axios.post(`${API_ENDPOINT}/scheduling/publish_entry`, req.body)
    res.status(200).json(ret.data)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
