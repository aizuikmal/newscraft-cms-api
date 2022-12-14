import axios from 'axios'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import md5 from 'md5'
import slugify from 'slugify'
import _ from 'lodash'
import dayjs from 'dayjs'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

  const cookies = parseCookies({ req })
  const property_id = cookies['_nc_active_property']
  const publisher_id = cookies['_nc_active_publisher']

  if (req.method === 'POST') {

    const { type, id } = req.query

    const { intent, url, method, status, desc } = req.body

    const payload = {
      intent,
      publisher_id,
      property_id,
      url,
      method,
      status,
      desc
    }

    if(type == 'insertOne'){
      payload.id = md5(dayjs().format('YYYYMMDDHHmmss') + url + publisher_id + property_id)
    }

    const find = { id: id }

    console.log(find, payload)

    if (!_.isEmpty(url)) {
      await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: type,
        collection: 'webhook',
        payload,
        find
      })
    }

    res.send('ok')
  }

}
