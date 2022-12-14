import axios from 'axios'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import md5 from 'md5'
import slugify from 'slugify'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

  const cookies = parseCookies({ req })
  const property_id = cookies['_nc_active_property']

  if (req.method === 'POST') {




    const ret_property = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'properties',
      find: { id: property_id }
    })
    const config_additional = req.body
    const config_updated = { ...ret_property.data.data.config, ...config_additional }

    await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'updateOne',
      collection: 'properties',
      payload: { config: config_updated },
      find: { id: property_id }
    })

    res.send('ok')




    // const config_payload = { ...req.body }
    // console.log(config_payload)
    // await axios.post(API_SERVER, {
    //   key: process.env.API_KEY,
    //   type: 'updateOne',
    //   collection: 'properties',
    //   payload: { config: config_payload },
    //   find: { id: property_id }
    // })

    // res.send('ok')

  } else {

    const ret = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'properties',
      find: { id: property_id }
    })

    console.log(ret.data.data)

    res.json({ status: 'ok', data: ret.data.data.config })

  }


}
