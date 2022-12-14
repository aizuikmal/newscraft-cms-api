import axios from 'axios'
require('dotenv').config()

export default async (req, res) => {
  const { eid, provider, id } = req.body

  let payload
  if (provider && id) {
    payload = {
      videos: [
        {
          type: provider,
          id: id,
          primary: true
        }
      ],
      id: eid,
      origin: 'mk-publisher'
    }
  } else {
    payload = {
      videos: false,
      id: eid,
      origin: 'mk-publisher'
    }
  }
  try {
    const ret = await axios.post('https://xxxxxxxxx/kinitv-mk-embed-helper', payload)
    res.status(200).send(ret.data)
  } catch (error) {
    console.log(error)
    res.status(401).send(error)
  }
}
