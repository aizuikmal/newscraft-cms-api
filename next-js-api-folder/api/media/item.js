import axios from 'axios';

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

    const { id } = req.query

    const active_pub = req.cookies['_nc_active_publisher']

    const find = { status : 1, publisher_id: active_pub, id }
    
    const ret = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        db: 'assets',
        type: 'findOne',
        collection: 'assets',
        find
    })

    res.json({data:ret.data})
}