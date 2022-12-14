import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

const listing_limit = 200

export default async (req, res) => {
  const { author, category, page = 0, date_start, date_end, publisher_id, property_id } = req.body

  const skip = page * listing_limit

  if (!req.body) {
    res.status(401).json({ status: 'body required' })
    return
  }
  // const query = `
  //   query get{
  //     stories(skip: ${skip}, listing_limit: ${listing_limit}, bypass_cache_key: "5913ab215e6aacbd86064fc896dae0af", publisher_id: "${publisher_id}", property_id: "${property_id}",
  //     ${author ? `author: "${author}"` : ''},
  //     ${category ? `category: "${category}"` : ''},
  //     ${date_start && date_end ? `date_pub_range: "${date_start}-${date_end}"` : ''},
  //   ) {
  //       i
  //       id
  //       title
  //       sid
  //       date_pub
  //       author
  //       category
  //       language
  //     }
  //   }
  // `



  const find = { publisher_id, property_id, status: 1 }

  if(date_start && date_end){
    find.date_pub = { '$gt': parseInt(date_start), '$lt': parseInt(date_end) }
  }

  if(author){
    find.author = { $in: author }
  }

  if(category){
    find.cat_str = category
  }

  const response = await axios.post(process.env.API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: 'entry',
    limit: listing_limit,
    skip,
    projection: {
      id: 1,
      sid: 1,
      title: 1,
      summary: 1,
      cat: 1,
      cat_str: 1,
      free: 1,
      feed_pos: 1,
      feed_id: 1,
      author: 1,
      author_display: 1,
      author_hidden: 1,
      tags: 1,
      image_feat: 1,
      images: 1,
      status: 1,
      date_pub: 1,
      date_schedule: 1,
      meta_contentstatus: 1,
      meta_contentstatus_2nd_user_mod: 1,
      meta_contentstatus_2nd_date_mod: 1,
      meta_contentstatus_3rd_user_mod: 1,
      meta_contentstatus_3rd_date_mod: 1,
      user_pub: 1,
      user_mod: 1,
      is_schedule: 1,
      post_type: 1,
      videos: 1
    },
    sort: { date_pub: -1 },
    find: find
  })

  const total_count = await axios.post(process.env.API_SERVER, {
    key: process.env.API_KEY,
    type: 'count',
    collection: 'entry',
    find: find
  })

  console.log('find',find)

  res.json({ status: 'ok', data: response.data.data, total: total_count.data.data })
}
