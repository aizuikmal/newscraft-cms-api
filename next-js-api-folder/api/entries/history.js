import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { eid, hid } = req.body

  const publisher_id = req.cookies['_nc_xxxxxxxxx']

  if(eid && !hid){
    const ret = await axios.post('https://xxxxxxxxx/nc-history/get', {
      id:eid, hash:md5(`${eid}xxxxxxxxx${eid}`), publisher_id
    })
    res.json({ status:'ok', data: ret.data.data })
  }

  if(hid && !eid){
    const ret = await axios.post('https://xxxxxxxxx/nc-history/get/'+hid, {
      id:eid, hash:md5(`${eid}xxxxxxxxx${eid}`), publisher_id
    })
    res.json({ status:'ok', data: ret.data.data })
  }

  

}
