import axios from 'axios'
const parse = require('url-parse')
require('dotenv').config()

export default async (req, res) => {
  const { url } = req.body

  const url_parsed = parse(url, true)

  if (!url_parsed.slashes) {
    res.status(200).send('error')
    return
  }

  if (url_parsed.host !== 'www.malaysiakini.com') {
    res.status(400).send('Invalid host')
    return
  }

  const url_arr = url_parsed.pathname.split('/')
  const sid = parseInt(url_arr[2])
  try {
    const ret = await axios.post(process.env.API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'entry',
      find: { sid: sid }
    })
    res.status(200).json(ret.data.data)
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
}
