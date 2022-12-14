import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

    const result = await axios.get(`https://xxxxxxxxx/autocomplete/${req.body.publisher_id}/${req.body.property_id}/actions`)
    
    const d = []
    result.data.data.map(item => {
      d.push(item.t)
    })
    res.send({ data: d })

}