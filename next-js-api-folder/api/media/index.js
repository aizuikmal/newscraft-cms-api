import axios from 'axios';

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
    // const ret = await axios.post(API_SERVER, {
    //     key: "xxxx0987",
    //     type: 'find',
    //     collection: 'assets',
    //     find: { status: 1 }
    // })
    // res.json(ret.data)
    res.send('ok')
}