import axios from 'axios'
import md5 from 'md5'
import slugify from 'slugify'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { type, id } = req.query
  
  if (type === 'updateOne' || type === 'insertOne') {
    let find = {}
    
    if(type === 'updateOne') {
      find = { id }
    }else{
      req.body.id = md5(`${Date.now()}_${req.body}`)
    }

    req.body.status = req.body.status ? req.body.status : 0
    req.body.order = req.body.order ? req.body.order : 0
    req.body.slug = req.body.name ? req.body.name : ''
    req.body.date_pub = Date.now()

    req.body.slug = slugify(req.body.slug, { lower: true })
    req.body.name = slugify(req.body.name, { lower: true })

    console.log(type,req.body)
    console.log(find,req.query)
    try {
      const ret_feed = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: type,
        collection: 'feed',
        payload: req.body,
        find
      })

      const feed_sort_payload = {
        id : req.body.id,
        name : req.body.slug,
        entries : [],
        publisher_id : req.body.publisher_id,
        property_id : req.body.property_id,
        dateModified : req.body.date_pub,
        series_id : req.body.id,
        series_property_id : req.body.property_id,
        status: req.body.status
      }
      console.log('feed_sort',feed_sort_payload)
      
      const ret_feedsort = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: type,
        collection: 'feed_sort',
        payload: feed_sort_payload,
        find
      })



      res.send('ok')
    } catch (err) {
      console.log(err)
      res.status(500).json({ status: 'An error has occured' })
    }
  } else {
    const response = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'find',
      collection: 'feed',
      find: req.body
    })
    res.send(response.data)
  }
}
