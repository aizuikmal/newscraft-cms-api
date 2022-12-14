import md5 from 'md5'
import fs from 'fs'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

const listing_limit = 200
const salt = '23930087799122639587121270980554839018017850537836922195104727533028865079598502081810506403831348'

export default async (req, res) => {

  const { author, category, date_start, date_end, publisher_id, property_id } = req.query

  const skip = page * listing_limit

  if (!req.query) {
    res.status(401).json({ status: 'query required' })
    return
  }

  const bunch = `${author}-${category}-${date_start}-${date_end}-${publisher_id}-${property_id}-${salt}`

  const hash_generate = md5(bunch)

  fs.writeFile(`/tmp/nc_downloadcsv_sessionfile_${hash_generate}`, bunch, (err,item) => {})

  res.json({ status: 'ok', data: hash_generate })

}
