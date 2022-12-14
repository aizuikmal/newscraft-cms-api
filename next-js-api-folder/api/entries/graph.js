import axios from 'axios'
import md5 from 'md5'
import dayjs from 'dayjs'
import { getSession } from 'next-auth/client'
import slugify from 'slugify'
import { parseCookies, setCookie, destroyCookie } from 'nookies'

const advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)

const fs = require('fs')

require('dotenv').config()

export default async (req, res) => {
  const cookies = parseCookies({ req })
  const property_id = cookies['_nc_active_property']
  const publisher_id = cookies['_nc_active_publisher']

  if (property_id && publisher_id) {
    const key = `mkini_en`

    const url_fetch = `https://xxxxxxxxx/graph/${key}.json`
    const ret = await axios.get(url_fetch)

    res.json({ status: 'ok', data: ret.data[key] })
  } else {
    res.json({ status: 'ko', data: [] })
  }
}
