import axios from 'axios'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import md5 from 'md5'
import slugify from 'slugify'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

  const cookies = parseCookies({ req })
  const property_id = cookies['_nc_active_property']
  const publisher_id = cookies['_nc_active_publisher']

  if (req.method === 'POST') {

    const { notice_text, notice_show } = req.body

    //first, get the publisher config. then we merge the new config with the old one.

    const ret_publisher = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'publishers',
      find: { id: publisher_id }
    })
    const config_additional = { notice_text, notice_show }
    const config_updated = { ...ret_publisher.data.data.config, ...config_additional }

    // console.log('config_updated', config_updated)

    await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'updateOne',
      collection: 'publishers',
      payload: { config: config_updated },
      find: { id: publisher_id }
    })

    res.send('ok')
  } else {

    const ret_publisher = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'publishers',
      find: { id: publisher_id }
    })
    
    console.log('ret_publisher', ret_publisher.data.data.config)

    res.json({
      status: 'ok', data: {
        notice_text: ret_publisher.data.data?.config?.notice_text || '',
        notice_show: ret_publisher.data.data?.config?.notice_show || false,
      }
    })

  }


}
