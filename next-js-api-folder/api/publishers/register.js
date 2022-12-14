import axios from 'axios'
import dayjs from 'dayjs'
import md5 from 'md5'
var timezone = require('dayjs/plugin/timezone')
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Kuala_Lumpur')

require('dotenv').config()

export default async (req, res) => {
  const data = req.body
  try {
    const pbPL = {
      country: data.country,
      org_desc: data.org_desc,
      org_size: data.org_size,
      org_name: data.org_name,
      org_code: data.org_name.toLowerCase().replace(/\s/g, '-'),
      dateAdded: dayjs(new Date()).format(),
      status: data.status ? 1 : 0,
      type: 'article'
    }

    pbPL.id = md5(data + process.env.HASHING_SALT + new Date())
    await axios
      .post(process.env.API_SERVER, {
        key: process.env.API_KEY,
        type: 'updateOne',
        collection: 'publishers',
        upsert: true,
        payload: pbPL,
        find: { id: pbPL.id }
      })
      .then(async result => {
        const { properties } = data
        const responses = properties.map((prop, i) => {
          const pl = {
            dateAdded: dayjs(new Date()).format(),
            pub_id: pbPL.id,
            lang: prop.lang,
            name: `${prop.name} ${prop.lang}`,
            url: data.url
          }
          pl.id = md5(pl.name + process.env.HASHING_SALT + new Date())
          return axios
            .post(process.env.API_SERVER, {
              key: process.env.API_KEY,
              type: 'updateOne',
              collection: 'properties',
              upsert: true,
              payload: pl,
              find: { id: pl.id }
            })
            .then(result => {
              return result.data
            })
        })
        res.send('OK')
      })
      .catch(err => {
        console.log(err)
        res.send('Something went wrong.')
      })
  } catch (error) {
    res.status(500).json(error)
  }
}
