import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { type, id } = req.query
  
  if (type === 'updateOne' || type === 'insertOne') {
    let find = {}
    
    if(type === 'updateOne') {
      find = { id: parseInt(id) }
    }else{
      //get ID, and get the last int ID from DB

      const ret = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        db: 'assets',
        type: 'find',
        collection: 'category',
        find: {},
        limit:1,
        sort: { id: -1 }
      })
      
      // req.body.id = md5(`${Date.now()}_${req.body}`)
      req.body.id = parseInt(ret.data.data[0].id) + 1
      req.body.fav = 0
    }

    req.body.status = req.body.status ? req.body.status : 0
    req.body.order = req.body.order ? req.body.order : 0
    req.body.date_pub = Date.now()
    console.log(type,req.body, find)
    try {
      const response = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        db: 'assets',
        type: type,
        collection: 'category',
        payload: req.body,
        // find: { status: 0 }
        find
      })
      res.send(response.data)
      // res.send('ok')
    } catch (err) {
      console.log(err)
      res.status(500).json({ status: 'An error has occured' })
    }
  } else {
    const response = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      db: 'assets',
      type: 'find',
      collection: 'category',
      find: req.body
    })
    res.send(response.data)
  }
}
