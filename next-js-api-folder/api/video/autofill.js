import axios from 'axios'
require('dotenv').config()

export default async (req, res) => {
  const { id, platform } = req.body
  const url = `https://xxxxxxxxx/${platform}-data?id=${id}`

  try {
    const ret = await axios.get(url, { get_param: 'value' })
    let payload = {}
    if (ret.data && platform === 'youtube') {
      payload = ret.data.items.length && ret.data.items[0].snippet || {}
    } else {
      payload = ret.data
    }
    res.send(payload)
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
}
