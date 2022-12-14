import axios from 'axios'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import md5 from 'md5'
import slugify from 'slugify'
import _ from 'lodash'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

  const cookies = parseCookies({ req })
  const property_id = cookies['_nc_active_property']
  const publisher_id = cookies['_nc_active_publisher']

  if (req.method === 'POST') {

    const { config_publisher, config_property } = req.body

    // console.log(req.body)

    if (!_.isEmpty(config_property)) {
      await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'updateOne',
        collection: 'properties',
        payload: { config: config_property },
        find: { id: property_id }
      })
    }

    if (!_.isEmpty(config_publisher)) {
      await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'updateOne',
        collection: 'publishers',
        payload: { config: config_publisher },
        find: { id: publisher_id }
      })
    }

    res.send('ok')
  } else {

    const ret_publisher = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'publishers',
      find: { id: publisher_id }
    })

    const ret_proprty = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'properties',
      find: { id: property_id }
    })

    res.json({
      status: 'ok', data: {
        config_publisher: ret_publisher.data.data.config || {},
        config_property: ret_proprty.data.data.config || {},
      }
    })

  }


}
