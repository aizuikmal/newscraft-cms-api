import axios from 'axios'
import md5 from 'md5'
import dayjs from 'dayjs'
import { getSession } from 'next-auth/client'

const advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

    const session = await getSession({ req })

    const { data, cat_id, pub_id } = req.body

    const uploaded_pl = []

    const return_payload = []
    const db_update = []
    data.length && data.map(item => {

        //generate our own id
        const id = md5(item.name + item.size.toString() + dayjs().format())
        
        const height = item.height
        const width = item.width

        const d = {
            "id" : id,
            "category" : parseInt(cat_id),
            "desc" : item.desc,
            "status" : 1,
            "original_name" : item.name,
            "name" : item.name,
            "height" : parseInt(height),
            "width" : parseInt(width),
            "type" : item.type,
            "content_length" : parseInt(item.size),
            "origin" : item.url,
            "user_pub" : session.user.email,
            "user_mod" : "",
            "date_pub" : parseInt(dayjs().format('X')),
            "date_mod" : parseInt(dayjs().format('X')),
            "date_pubh" : dayjs().format(),
            "publisher_id" : pub_id,
            "tag":"test"
        }

        db_update.push(d)
        uploaded_pl.push({ id, key:id, desc: item.desc, name: item.name, url:item.url, height:parseInt(height), width:parseInt(width) })

    })
   
    console.log('db_update', db_update)
    // console.log('session',session)

    const ret = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        db: 'assets',
        type: 'insertMany',
        collection: 'assets',
        payload: db_update
    })

    res.json({'status':'OK', data:uploaded_pl})
}